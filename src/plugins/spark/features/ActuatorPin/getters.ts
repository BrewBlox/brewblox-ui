import { RootStore } from '@/store/state';
import { blockById } from '@/plugins/spark/store/getters';
import { ActuatorPinBlock } from './state';

export const typeName = 'ActuatorPin';

export const state = [
  'Inactive',
  'Active',
  'Unknown',
];

export const getById = (store: RootStore, serviceId: string, id: string) =>
  blockById<ActuatorPinBlock>(store, serviceId, id, typeName);
