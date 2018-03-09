import { allBlocks, blockById } from '../getters';

import { Series } from '../state';
import { OneWireTempSensorBlock } from './OneWireTempSensor';

export function getById(id: string): OneWireTempSensorBlock {
  const block = blockById(id);

  // force block type
  if (!block || block.type !== 'OneWireTempSensor') {
    throw new Error('Block is not a valid OneWireTempSensor');
  }

  return block;
}

export function getMetricsById(id: string): Series[] {
  const block = getById(id);

  return block.metrics;
}

export function getAll(): OneWireTempSensorBlock[] {
  return <OneWireTempSensorBlock[]>allBlocks()
    .filter(block => block.type === 'OneWireTempSensor');
}
