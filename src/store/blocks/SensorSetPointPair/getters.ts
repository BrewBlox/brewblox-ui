import { blockById } from '../getters';

import { SensorSetPointPairBlock } from './SensorSetPointPair';

export function getById(id: string): SensorSetPointPairBlock {
  const block = blockById(id);

  // force block type
  if (block.type !== 'SensorSetPointPair') {
    throw new Error('Block is not a valid SensorSetPointPair');
  }

  return block;
}
