import { blockById } from '../getters';

import { SetPointSimpleBlock } from './SetPointSimple';

export function getById(id: string): SetPointSimpleBlock {
  const block = blockById(id);

  // force block type
  if (block.type !== 'SetPointSimple') {
    throw new Error('Block is not a valid SetPointSimple');
  }

  return block;
}
