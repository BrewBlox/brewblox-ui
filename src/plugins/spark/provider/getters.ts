import { Block } from '@/plugins/spark/state';

export const widgetSize = {
  cols: 3,
  rows: 4,
};

export const sysInfoId = '__sysinfo';
export const profilesId = '__profiles';
export const oneWireBusId = '__onewirebus';
export const ticksId = '__time';

export const isSystemBlock = (block: Block) =>
  [
    sysInfoId,
    profilesId,
    oneWireBusId,
    ticksId,
  ].includes(block.id);
