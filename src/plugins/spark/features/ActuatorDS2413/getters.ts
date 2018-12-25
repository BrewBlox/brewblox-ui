import { blockById } from '@/plugins/spark/store/getters';
import { RootStore } from '@/store/state';
import { ActuatorDS2413Block } from './state';

export const typeName = 'ActuatorDS2413';

export const channel = [
  'Unset',
  'A',
  'B',
];

export const getById = (store: RootStore, serviceId: string, id: string) =>
  blockById<ActuatorDS2413Block>(store, serviceId, id, typeName);
