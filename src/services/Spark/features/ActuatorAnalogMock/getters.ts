import { RootStore } from '@/store/state';
import { allBlocks, blockById } from '@/services/Spark/store/getters';
import { ActuatorAnalogMockBlock } from './state';

export const typeName = 'ActuatorAnalogMock';

export const getById = (store: RootStore, serviceId: string, id: string) =>
  blockById<ActuatorAnalogMockBlock>(store, serviceId, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocks<ActuatorAnalogMockBlock>(store, serviceId, typeName);
