import { blockById } from '@/plugins/spark/store/getters';
import { RootStore } from '@/store/state';
import { DS2413Block } from './state';

export const typeName = 'ActuatorPin';

export const state = [
  'Inactive',
  'Active',
  'Unknown',
];

export const getById = (store: RootStore, serviceId: string, id: string) =>
  blockById<DS2413Block>(store, serviceId, id, typeName);
