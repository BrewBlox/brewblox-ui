import { allBlocks, blockById } from '../getters';

import { SetPointSimpleBlock } from './SetPointSimple';

export function getById(id: string): SetPointSimpleBlock {
  const block = blockById(id);

  // force block type
  if (!block || block.type !== 'SetPointSimple') {
    throw new Error('Block is not a valid SetPointSimple');
  }

  return block;
}

export function getAll(): SetPointSimpleBlock[] {
  return <SetPointSimpleBlock[]>allBlocks()
    .filter(block => block.type === 'SetPointSimple');
}
