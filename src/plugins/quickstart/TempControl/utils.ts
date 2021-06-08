import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import {
  ActuatorOffsetBlock,
  ActuatorPwmBlock,
  Block,
  BlockType,
  DigitalActuatorBlock,
  Link,
  MotorValveBlock,
  PidBlock,
  SetpointProfileBlock,
  SetpointSensorPairBlock,
  TempSensorCombiBlock,
  TempSensorMockBlock,
  TempSensorOneWireBlock,
} from '@/shared-types';
import { bloxLink, createBlockDialogPromise, makeTypeFilter } from '@/utils';

import { TempControlConfig, TempControlMode } from './types';

interface TempControlBlocks {
  setpoint: SetpointSensorPairBlock;
  profile: SetpointProfileBlock | null;
  coolPid: PidBlock | null;
  heatPid: PidBlock | null;
}

export interface TempControlProblem {
  desc: string;
  autofix?: (config: TempControlConfig) => Awaitable<unknown>;
}

export interface AutofixCallbacks {
  showConfig(): Awaitable<unknown>;
}

type TempSensorBlock = TempSensorCombiBlock | TempSensorMockBlock | TempSensorOneWireBlock;

const isProfile = makeTypeFilter<SetpointProfileBlock>(BlockType.SetpointProfile);
const isPwm = makeTypeFilter<ActuatorPwmBlock>(BlockType.ActuatorPwm);
const isActuatorOffset = makeTypeFilter<ActuatorOffsetBlock>(BlockType.ActuatorOffset);
const isDriver =
  (block: Block): block is SetpointProfileBlock | ActuatorOffsetBlock =>
    isProfile(block) || isActuatorOffset(block);

function linkEq(left: Link | null | undefined, right: Link | null | undefined): boolean {
  return left?.id === right?.id;
}

function linkStr(...blocks: (Block | Link)[]): string {
  return blocks
    .map(v => `<i>${v?.id ?? '[not set]'}</i>`)
    .join(' -> ');
}

function adjust<T extends Block>(block: T, func: (v: T) => unknown): (() => Awaitable<unknown>) {
  return () => {
    const actual = sparkStore.blockByAddress<T>(block);
    if (actual) {
      func(actual);
      return sparkStore.saveBlock(actual);
    }
  };
}

function getBlocks(config: TempControlConfig, mode: TempControlMode | null = null): TempControlBlocks {
  const module = sparkStore.moduleById(config.serviceId);
  if (!module) {
    throw new Error(`Spark service with ID <b>${config.serviceId}</b> not found`);
  }

  const coolPid = module.blockByLink<PidBlock>(config.coolPid);
  const heatPid = module.blockByLink<PidBlock>(config.heatPid);
  const profile = module.blockByLink<SetpointProfileBlock>(config.profile);

  const setpointLink = [
    mode?.setpoint,
    coolPid?.data.inputId,
    heatPid?.data.inputId,
  ]
    .find(v => v && v.id);

  if (!setpointLink?.id) {
    throw new Error('No Setpoint defined');
  }

  const setpoint = module.blockByLink<SetpointSensorPairBlock>(setpointLink);
  if (!setpoint) {
    throw new Error(`Setpoint ${linkStr(setpointLink)} not found`);
  }

  if (config.coolPid.id && !coolPid) {
    throw new Error(`Cool PID ${linkStr(config.coolPid)} not found`);
  }

  if (config.heatPid.id && !heatPid) {
    throw new Error(`Heat PID ${linkStr(config.heatPid)} not found`);
  }

  if (config.profile.id && !profile) {
    throw new Error(`Profile ${linkStr(config.profile)} not found`);
  }

  if (!mode && coolPid && heatPid && !linkEq(coolPid.data.inputId, heatPid.data.inputId)) {
    throw new Error('Cool PID and Heat PID use different Setpoints');
  }

  return {
    setpoint,
    profile,
    coolPid,
    heatPid,
  };
}

export async function applyMode(config: TempControlConfig, mode: TempControlMode): Promise<void> {
  const { coolPid, heatPid, setpoint, profile } = getBlocks(config, mode);

  if (mode.coolConfig && !coolPid) {
    throw new Error('No cool PID defined');
  }

  if (mode.heatConfig && !heatPid) {
    throw new Error('No heat PID defined');
  }

  setpoint.data.settingEnabled = false;
  await sparkStore.saveBlock(setpoint);

  if (profile) {
    profile.data.targetId = bloxLink(setpoint.id);
    await sparkStore.saveBlock(profile);
  }

  // Disable all blocks driving target setpoint
  await Promise.all(
    sparkStore
      .serviceBlocks(config.serviceId)
      .filter(isDriver)
      .filter(block => block.data.targetId.id === setpoint.id)
      .map(block => {
        block.data.enabled = false;
        return sparkStore.saveBlock(block);
      }));

  if (coolPid && mode.coolConfig) {
    coolPid.data = {
      ...coolPid.data,
      ...mode.coolConfig,
      inputId: mode.setpoint,
    };
    await sparkStore.saveBlock(coolPid);
  }

  if (heatPid && mode.heatConfig) {
    heatPid.data = {
      ...heatPid.data,
      ...mode.heatConfig,
      inputId: mode.setpoint,
    };
    await sparkStore.saveBlock(heatPid);
  }
}

function findPidProblems(module: SparkServiceModule, pid: PidBlock): TempControlProblem[] {
  const issues: TempControlProblem[] = [];

  if (!pid.data.enabled) {
    issues.push({
      desc: `PID is disabled: ${linkStr(pid)}`,
      autofix: adjust(pid, block => block.data.enabled = true),
    });
  }

  const analogLink = pid.data.outputId;
  if (!analogLink.id) {
    issues.push({
      desc: `PID output not defined: ${linkStr(pid)}`,
      autofix: () => createBlockDialogPromise(pid),
    });
    return issues;
  }

  const analog = module.blockByLink(analogLink);
  if (!analog) {
    issues.push({
      desc: `PID output not found: ${linkStr(pid, analogLink)}`,
      autofix: () => createBlockDialogPromise(pid),
    });
    return issues;
  }

  if (isPwm(analog)) {
    if (!analog.data.enabled) {
      issues.push({
        desc: `PWM is disabled: ${linkStr(pid, analog)}`,
        autofix: adjust(analog, block => block.data.enabled = true),
      });
    }

    const digitalLink = analog.data.actuatorId;
    if (!digitalLink.id) {
      issues.push({
        desc: `Digital Actuator not defined: ${linkStr(pid, analog)}`,
        autofix: () => createBlockDialogPromise(analog),
      });
      return issues;
    }

    const digital = module.blockByLink<DigitalActuatorBlock | MotorValveBlock>(analog.data.actuatorId);
    if (!digital) {
      issues.push({
        desc: `Digital Actuator not found: ${linkStr(pid, analog, digitalLink)}`,
        autofix: () => createBlockDialogPromise(analog),
      });
      return issues;
    }

    const deviceLink = digital.data.hwDevice;
    // It is possible for MotorValve startChannel to be 0, so only check for DigitalActuator channel
    if (!deviceLink.id || (digital.type === BlockType.DigitalActuator && !digital.data.channel)) {
      issues.push({
        desc: `Pin Channel not defined: ${linkStr(pid, analog, digital)}`,
        autofix: () => createBlockDialogPromise(digital),
      });
      return issues;
    }

    const device = module.blockByLink(deviceLink);
    if (!device) {
      issues.push({
        desc: `Pin Array not found: ${linkStr(pid, analog, digital, deviceLink)}`,
        autofix: () => createBlockDialogPromise(digital),
      });
      return issues;
    }
  }

  if (isActuatorOffset(analog)) {
    if (!analog.data.enabled) {
      issues.push({
        desc: `Setpoint Driver is disabled: ${linkStr(pid, analog)}`,
        autofix: adjust(analog, block => block.data.enabled = true),
      });
    }

    const referenceLink = analog.data.referenceId;
    if (!referenceLink.id) {
      issues.push({
        desc: `Reference block not defined: ${linkStr(pid, analog)}`,
        autofix: () => createBlockDialogPromise(analog),
      });
      return issues;
    }

    const reference = module.blockByLink(referenceLink);
    if (!reference) {
      issues.push({
        desc: `Reference block not found: ${linkStr(pid, analog, referenceLink)}`,
        autofix: () => createBlockDialogPromise(analog),
      });
      return issues;
    }

    // ActuatorAnalogMock also is a valid target, but has no enabled flag
    if (reference.data.enabled === false) {
      issues.push({
        desc: `Reference block is disabled: ${linkStr(pid, analog, reference)}`,
        autofix: adjust(reference, block => block.data.enabled = true),
      });
    }

    const drivenLink = analog.data.targetId;
    if (!drivenLink.id) {
      issues.push({
        desc: `Driven block not defined: ${linkStr(pid, analog)}`,
        autofix: () => createBlockDialogPromise(analog),
      });
      return issues;
    }

    const driven = module.blockByLink(drivenLink);
    if (!driven) {
      issues.push({
        desc: `Driven block not found: ${linkStr(pid, analog, drivenLink)}`,
        autofix: () => createBlockDialogPromise(analog),
      });
      return issues;
    }

    // ActuatorAnalogMock also is a valid target, but has no enabled flag
    if (driven.data.enabled === false) {
      issues.push({
        desc: `Driven block is disabled: ${linkStr(pid, analog, driven)}`,
        autofix: adjust(driven, block => block.data.enabled = true),
      });
    }
  }

  return issues;
}

export function findControlProblems(config: TempControlConfig, callbacks: AutofixCallbacks): TempControlProblem[] {
  const issues: TempControlProblem[] = [];
  const module = sparkStore.moduleById(config.serviceId);

  if (!config.serviceId) {
    issues.push({
      desc: 'Spark service not defined',
      autofix: callbacks.showConfig,
    });
    return issues;
  }

  if (!module) {
    issues.push({
      desc: `Spark service not found: <b>${config.serviceId}</b>`,
      autofix: callbacks.showConfig,
    });
    return issues;
  }

  const coolPid = module.blockByLink<PidBlock>(config.coolPid);
  const heatPid = module.blockByLink<PidBlock>(config.heatPid);
  const profile = module.blockByLink<SetpointProfileBlock>(config.profile);

  if (!config.coolPid.id && !config.heatPid.id) {
    issues.push({
      desc: 'Cool PID and Heat PID both undefined',
      autofix: callbacks.showConfig,
    });
  }

  if (config.coolPid.id && !coolPid) {
    issues.push({
      desc: `Cool PID not found: ${linkStr(config.coolPid)}`,
      autofix: callbacks.showConfig,
    });
    return issues;
  }

  if (config.heatPid.id && !heatPid) {
    issues.push({
      desc: `Heat PID not found: ${linkStr(config.heatPid)}`,
      autofix: callbacks.showConfig,
    });
    return issues;
  }

  if (config.profile.id && !profile) {
    issues.push({
      desc: `Profile not found: ${linkStr(config.profile)}`,
      autofix: callbacks.showConfig,
    });
    return issues;
  }

  const mode = config.modes.find(v => v.id === config.activeMode);
  const modeSetpointLink = mode?.setpoint;
  const coolSetpointLink = coolPid?.data.inputId;
  const heatSetpointLink = heatPid?.data.inputId;

  const setpointLink = [
    modeSetpointLink,
    coolSetpointLink,
    heatSetpointLink,
  ]
    .find(v => v && v.id);

  if (!setpointLink?.id) {
    issues.push({
      desc: 'Setpoint not defined',
      autofix: callbacks.showConfig,
    });
    return issues;
  }

  const setpoint = module.blockByLink<SetpointSensorPairBlock>(setpointLink);
  if (!setpoint) {
    issues.push({
      desc: `Setpoint not found: ${linkStr(setpointLink)}`,
      autofix: callbacks.showConfig,
    });
    return issues;
  }

  if (mode && !linkEq(setpointLink, modeSetpointLink)) {
    issues.push({
      desc: `Setpoint not defined: ${mode.title} mode`,
      autofix: callbacks.showConfig,
    });
  }
  if (coolPid && !linkEq(setpointLink, coolSetpointLink)) {
    issues.push({
      desc: `Cool PID Setpoint does not match: ${linkStr(setpointLink)}`,
      autofix: adjust(coolPid, block => block.data.inputId = setpointLink),
    });
  }
  if (heatPid && !linkEq(setpointLink, heatSetpointLink)) {
    issues.push({
      desc: `Heat PID Setpoint does not match: ${linkStr(setpointLink)}`,
      autofix: adjust(heatPid, block => block.data.inputId = setpointLink),
    });
  }
  if (profile && !linkEq(setpointLink, profile.data.targetId)) {
    issues.push({
      desc: `Profile Setpoint does not match: ${linkStr(setpointLink)}`,
      autofix: adjust(profile, block => block.data.targetId = setpointLink),
    });
  }

  const sensorLink = setpoint.data.sensorId;
  const sensor = module.blockByLink<TempSensorBlock>(sensorLink);

  if (!sensorLink.id) {
    issues.push({
      desc: `Temp Sensor not defined: ${linkStr(setpoint)}`,
      autofix: () => createBlockDialogPromise(setpoint),
    });
  }
  else if (!sensor) {
    issues.push({
      desc: `Temp Sensor not found: ${linkStr(setpoint, sensorLink)}`,
      autofix: () => createBlockDialogPromise(setpoint),
    });
  }

  if (coolPid) {
    issues.push(...findPidProblems(module, coolPid));
  }

  if (heatPid) {
    issues.push(...findPidProblems(module, heatPid));
  }

  return issues;
}
