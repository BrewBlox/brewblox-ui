import { RootStore } from '@/store/state';

import { allBlocks, blockById } from '@/services/Spark/store/getters';

import { TempSensorMockBlock } from './state';

export const typeName = 'TempSensorMock';

export const getById = (store: RootStore, serviceId: string, id: string) =>
  blockById<TempSensorMockBlock>(store, serviceId, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocks<TempSensorMockBlock>(store, serviceId, typeName);
