import { Store } from 'vuex';

import { allBlocks, blockById } from '../getters';

import { OneWireTempSensorBlock } from './OneWireTempSensor';

import { State } from '../../state';

export function getById(store: Store<State>, id: string): OneWireTempSensorBlock {
  const block = blockById(store, id);

  // force block type
  if (!block || block.type !== 'OneWireTempSensor') {
    throw new Error('Block is not a valid OneWireTempSensor');
  }

  return block;
}

export function getAll(store: Store<State>, serviceId: string): OneWireTempSensorBlock[] {
  return allBlocks(store)
    .filter(block => block.type === 'OneWireTempSensor' &&
      block.serviceId === serviceId) as OneWireTempSensorBlock[];
}
