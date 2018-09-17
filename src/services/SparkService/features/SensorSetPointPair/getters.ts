import { RootStore } from '@/store/state';

import { allBlocksFromService, blockById } from '@/services/SparkService/store/getters';

import { SensorSetPointPairBlock } from './state';

export const typeName = 'SensorSetPointPair';

export const getById = (store: RootStore, id: string) =>
  blockById<SensorSetPointPairBlock>(store, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocksFromService<SensorSetPointPairBlock>(store, serviceId, typeName);
