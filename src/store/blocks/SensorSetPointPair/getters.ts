import { RootStore } from '../../state';

import { allBlocksFromService, blockById } from '../getters';

import { SensorSetPointPairBlock } from './SensorSetPointPair';

export const typeName = 'SensorSetPointPair';

export const getById = (store: RootStore, id: string) =>
  blockById<SensorSetPointPairBlock>(store, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocksFromService<SensorSetPointPairBlock>(store, serviceId, typeName);
