import { bloxLink } from '@/helpers/bloxfield';
import { createBlockDialogPromise } from '@/helpers/dialog';
import { typeMatchFilter } from '@/helpers/functional';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import {
  ActuatorOffsetBlock,
  ActuatorPwmBlock,
  Block,
  BlockType,
  DigitalActuatorBlock,
  Link,
  PidBlock,
  SetpointProfileBlock,
  SetpointSensorPairBlock,
  TempSensorCombiBlock,
  TempSensorMockBlock,
  TempSensorOneWireBlock,
} from '@/shared-types';

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

type TempSensorBlock = TempSensorCombiBlock | TempSensorMockBlock | TempSensorOneWireBlock;

const isProfile = typeMatchFilter<SetpointProfileBlock>(BlockType.SetpointProfile);
const isPwm = typeMatchFilter<ActuatorPwmBlock>(BlockType.ActuatorPwm);
const isActuatorOffset = typeMatchFilter<ActuatorOffsetBlock>(BlockType.ActuatorOffset);
const isDriver =
  (block: Block): block is SetpointProfileBlock | ActuatorOffsetBlock =>
    isProfile(block) || isActuatorOffset(block);

function linkEq(left: Link | null, right: Link | null): boolean {
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

  if (config.coolPid.id && !coolPid) {
    throw new Error(`Cool PID ${linkStr(config.coolPid)} not found`);
  }

  if (config.heatPid.id && !heatPid) {
    throw new Error(`Heat PID ${linkStr(config.heatPid)} not found`);
  }

  if (!mode && coolPid && heatPid && !bloxLink(coolPid.data.inputId).eq(heatPid.data.inputId)) {
    throw new Error('Cool PID and Heat PID have different input Setpoints');
  }

  const setpointId = mode?.setpoint.id
    ?? coolPid?.data.inputId.id
    ?? heatPid?.data.inputId.id
    ?? null;
  const setpoint = module.blockById<SetpointSensorPairBlock>(setpointId);

  if (!setpointId) {
    throw new Error('No Setpoint defined');
  }
  if (!setpoint) {
    throw new Error(`Setpoint <i>${setpointId}</i> not found`);
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
    profile.data.drivenTargetId = bloxLink(setpoint.id);
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

  const analog = module.blockByLink(pid.data.outputId);
  if (!analog) {
    issues.push({
      desc: `No output block defined in ${linkStr(pid)}`,
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

    const digital = module.blockByLink<DigitalActuatorBlock>(analog.data.actuatorId);
    if (!digital) {
      issues.push({
        desc: `No Actuator block defined in ${linkStr(pid, analog)}`,
        autofix: () => createBlockDialogPromise(analog),
      });
      return issues;
    }

    const device = module.blockByLink(digital.data.hwDevice);
    if (!device) {
      issues.push({
        desc: `No Pin block defined in ${linkStr(pid, analog, digital)}`,
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

    const setpoint = module.blockByLink(analog.data.targetId);
    if (!setpoint) {
      issues.push({
        desc: `No Setpoint block defined in ${linkStr(pid, analog)}`,
        autofix: () => createBlockDialogPromise(analog),
      });
      return issues;
    }
  }

  return issues;
}

export function findControlProblems(config: TempControlConfig): TempControlProblem[] {
  const issues: TempControlProblem[] = [];
  const module = sparkStore.moduleById(config.serviceId);

  if (!config.serviceId) {
    issues.push({ desc: 'No Spark service ID defined' });
    return issues;
  }

  if (!module) {
    issues.push({ desc: `Spark service with ID <b>${config.serviceId}</b> not found` });
    return issues;
  }

  const coolPid = module.blockByLink<PidBlock>(config.coolPid);
  const heatPid = module.blockByLink<PidBlock>(config.heatPid);
  const profile = module.blockByLink<SetpointProfileBlock>(config.profile);

  if (!config.coolPid.id && !config.heatPid.id) {
    issues.push({ desc: 'Cool PID and Heat PID both undefined' });
  }

  if (config.coolPid.id && !coolPid) {
    issues.push({ desc: `Cool PID ${linkStr(config.coolPid)} not found` });
    return issues;
  }

  if (config.heatPid.id && !heatPid) {
    issues.push({ desc: `Heat PID ${linkStr(config.heatPid)} not found` });
    return issues;
  }

  if (config.profile && !profile) {
    issues.push({ desc: `Profile ${linkStr(config.profile)} not found.` });
    return issues;
  }

  const mode = config.modes.find(v => v.id === config.activeMode);
  const modeSetpointLink = mode ? bloxLink(mode.setpoint) : null;
  const coolSetpointLink = coolPid ? bloxLink(coolPid.data.inputId) : null;
  const heatSetpointLink = heatPid ? bloxLink(heatPid.data.inputId) : null;
  const setpointLink = modeSetpointLink ?? coolSetpointLink ?? heatSetpointLink;

  const setpoint = module.blockByLink<SetpointSensorPairBlock>(setpointLink);

  if (!setpointLink) {
    issues.push({ desc: 'No Setpoint defined' });
    return issues;
  }
  if (!setpoint) {
    issues.push({ desc: `Setpoint ${linkStr(setpointLink)} not found.` });
    return issues;
  }

  if (mode && !linkEq(setpointLink, modeSetpointLink)) {
    issues.push({ desc: `No setpoint defined in ${mode.title} mode` });
  }
  if (coolPid && !linkEq(setpointLink, coolSetpointLink)) {
    issues.push({
      desc: `Cool PID Setpoint does not match ${linkStr(setpointLink)}`,
      autofix: adjust(coolPid, block => block.data.inputId = setpointLink),
    });
  }
  if (heatPid && !linkEq(setpointLink, heatSetpointLink)) {
    issues.push({
      desc: `Heat PID Setpoint does not match ${linkStr(setpointLink)}`,
      autofix: adjust(heatPid, block => block.data.inputId = setpointLink),
    });
  }
  if (profile && !linkEq(setpointLink, profile.data.targetId)) {
    issues.push({
      desc: `Profile Setpoint does not match ${linkStr(setpointLink)}`,
      autofix: adjust(profile, block => block.data.targetId = setpointLink),
    });
  }

  const sensorLink = setpoint.data.sensorId;
  const sensor = module.blockByLink<TempSensorBlock>(sensorLink);

  if (!sensorLink) {
    issues.push({
      desc: `No temp sensor defined in ${linkStr(setpoint)}`,
      autofix: () => createBlockDialogPromise(setpoint),
    });
  }
  else if (!sensor) {
    issues.push({ desc: `Temp sensor ${linkStr(sensorLink)} not found.` });
  }

  if (coolPid) {
    issues.push(...findPidProblems(module, coolPid));
  }

  if (heatPid) {
    issues.push(...findPidProblems(module, heatPid));
  }

  return issues;
}
