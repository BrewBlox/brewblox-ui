import { Store } from 'vuex';

import { allBlocks, blockById } from '../getters';

import { SensorSetPointPairBlock } from './SensorSetPointPair';

import { State } from '../../state';

export function getById(store: Store<State>, id: string): SensorSetPointPairBlock {
  const block = blockById(store, id);

  // force block type
  if (!block || block.type !== 'SensorSetPointPair') {
    throw new Error('Block is not a valid SensorSetPointPair');
  }

  return block;
}

export function getAll(store: Store<State>): SensorSetPointPairBlock[] {
  return <SensorSetPointPairBlock[]>allBlocks(store)
    .filter(block => block.type === 'SensorSetPointPair');
}
