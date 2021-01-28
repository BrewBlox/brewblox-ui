import { bloxLink, prettyLink } from '@/helpers/bloxfield';
import { typeMatchFilter } from '@/helpers/functional';
import { sparkStore } from '@/plugins/spark/store';
import {
  ActuatorOffsetBlock,
  Block,
  BlockType,
  PidBlock,
  SetpointProfileBlock,
  SetpointSensorPairBlock,
} from '@/shared-types';

import { TempControlConfig, TempControlMode } from './types';

interface TempControlBlocks {
  setpoint: SetpointSensorPairBlock;
  profile: SetpointProfileBlock | null;
  coolPid: PidBlock | null;
  heatPid: PidBlock | null;
}

const profileFilter = typeMatchFilter<SetpointProfileBlock>(BlockType.SetpointProfile);
const offsetFilter = typeMatchFilter<ActuatorOffsetBlock>(BlockType.ActuatorOffset);
const driverFilter =
  (block: Block): block is SetpointProfileBlock | ActuatorOffsetBlock =>
    profileFilter(block) || offsetFilter(block);

function getBlocks(config: TempControlConfig, mode: TempControlMode | null = null): TempControlBlocks {
  const module = sparkStore.moduleById(config.serviceId);
  if (!module) {
    throw new Error(`Spark service with ID <b>${config.serviceId}</b> not found.`);
  }

  const coolPid = module.blockByLink<PidBlock>(config.coolPid);
  const heatPid = module.blockByLink<PidBlock>(config.heatPid);
  const profile = module.blockByLink<SetpointProfileBlock>(config.profile);

  if (config.coolPid.id && !coolPid) {
    throw new Error(`Cool PID <i>${prettyLink(config.coolPid)}</i> not found.`);
  }

  if (config.heatPid.id && !heatPid) {
    throw new Error(`Heat PID <i>${prettyLink(config.heatPid)}</i> not found.`);
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
    throw new Error(`Setpoint <i>${setpointId}</i> not found.`);
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
      .filter(driverFilter)
      .filter(block => block.data.drivenTargetId.id === setpoint.id)
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
