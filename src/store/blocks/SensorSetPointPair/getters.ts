import { allBlockFromService, blockById } from '../getters';

import { SensorSetPointPairBlock, typeName } from './SensorSetPointPair';

import { RootStore } from '../../state';

export function getById(store: RootStore, id: string): SensorSetPointPairBlock {
  return blockById(store, id, typeName) as SensorSetPointPairBlock;
}

export function getAll(store: RootStore, serviceId: string): SensorSetPointPairBlock[] {
  return allBlockFromService(store, serviceId)
    .filter(block => block.type === 'SensorSetPointPair') as SensorSetPointPairBlock[];
}
