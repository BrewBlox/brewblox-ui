import { RootStore } from '../../state';

import { allBlockFromService, blockById } from '../getters';

import { SensorSetPointPairBlock } from './SensorSetPointPair';

export const typeName = 'SensorSetPointPair';

export function getById(store: RootStore, id: string): SensorSetPointPairBlock {
  return blockById(store, id, typeName) as SensorSetPointPairBlock;
}

export function getAll(store: RootStore, serviceId: string): SensorSetPointPairBlock[] {
  return allBlockFromService(store, serviceId)
    .filter(block => block.type === typeName) as SensorSetPointPairBlock[];
}
