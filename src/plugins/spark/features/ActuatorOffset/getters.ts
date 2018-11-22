import { blockById } from '@/plugins/spark/store/getters';
import { RootStore } from '@/store/state';
import { ActuatorOffsetBlock } from './state';

export const typeName = 'ActuatorOffset';

export const getById = (store: RootStore, serviceId: string, id: string) =>
  blockById<ActuatorOffsetBlock>(store, serviceId, id, typeName);
