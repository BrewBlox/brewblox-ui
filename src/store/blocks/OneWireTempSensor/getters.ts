import { blockById } from '../getters';

import { OneWireTempSensorBlock } from './OneWireTempSensor';

export function getById(id: string): OneWireTempSensorBlock {
  const block = blockById(id);

  // force block type
  if (block.type !== 'OneWireTempSensor') {
    throw new Error('Block is not a valid OneWireTempSensor');
  }

  return block;
}
