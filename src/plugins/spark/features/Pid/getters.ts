import { blockById } from '@/plugins/spark/store/getters';
import { RootStore } from '@/store/state';
import { PidBlock } from './state';

export const typeName = 'Pid';

export const filters = [
  '30s',
  '1m',
  '3m',
  '5m',
  '10m',
  '20m',
  '45m',
];

export const getById = (store: RootStore, serviceId: string, id: string) =>
  blockById<PidBlock>(store, serviceId, id, typeName);
