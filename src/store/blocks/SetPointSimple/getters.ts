import { Store } from 'vuex';

import { allBlocks, blockById } from '../getters';

import { SetPointSimpleBlock } from './SetPointSimple';

import { State } from '../../state';

export function getById(store: Store<State>, id: string): SetPointSimpleBlock {
  const block = blockById(store, id);

  // force block type
  if (!block || block.type !== 'SetPointSimple') {
    throw new Error('Block is not a valid SetPointSimple');
  }

  return block;
}

export function getAll(store: Store<State>): SetPointSimpleBlock[] {
  return <SetPointSimpleBlock[]>allBlocks(store)
    .filter(block => block.type === 'SetPointSimple');
}
