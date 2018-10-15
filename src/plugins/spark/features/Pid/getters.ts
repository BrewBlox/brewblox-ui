import { RootStore } from '@/store/state';
import { allBlocks, blockById } from '@/plugins/spark/store/getters';
import { PidBlock } from './state';

export const typeName = 'Pid';

export const filters = [
  'FILT_30s',
  'FILT_1m',
  'FILT_3m',
  'FILT_5m',
  'FILT_10m',
  'FILT_20m',
  'FILT_45m',
];

export const getById = (store: RootStore, serviceId: string, id: string) =>
  blockById<PidBlock>(store, serviceId, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocks<PidBlock>(store, serviceId, typeName);
