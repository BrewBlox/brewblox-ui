import { allBlockFromService, blockById } from '../getters';

import { OneWireTempSensorBlock, typeName } from './OneWireTempSensor';

import { RootStore } from '../../state';

export function getById(store: RootStore, id: string): OneWireTempSensorBlock {
  return blockById(store, id, typeName) as OneWireTempSensorBlock;
}

export function getAll(store: RootStore, serviceId: string): OneWireTempSensorBlock[] {
  return allBlockFromService(store, serviceId)
    .filter(block => block.type === typeName) as OneWireTempSensorBlock[];
}
