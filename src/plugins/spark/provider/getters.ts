import { Block } from '@/plugins/spark/state';
import { blockIds } from '@/plugins/spark/store/getters';
import { RootStore } from '@/store/state';

export const widgetSize = {
  cols: 4,
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

export const isReady = (store: RootStore, serviceId: string) =>
  [
    sysInfoId,
    profilesId,
    oneWireBusId,
    ticksId,
  ].every(id => blockIds(store, serviceId).includes(id));
