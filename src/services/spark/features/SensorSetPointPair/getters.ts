import { RootStore } from '@/store/state';

import { allBlocks, blockById } from '@/services/spark/store/getters';

import { SensorSetPointPairBlock } from './state';

export const typeName = 'SensorSetPointPair';

export const getById = (store: RootStore, serviceId: string, id: string) =>
  blockById<SensorSetPointPairBlock>(store, serviceId, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocks<SensorSetPointPairBlock>(store, serviceId, typeName);
