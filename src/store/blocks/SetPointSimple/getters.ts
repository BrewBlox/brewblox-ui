import { allBlockFromService, blockById } from '../getters';

import { SetPointSimpleBlock } from './SetPointSimple';

import { RootStore } from '../../state';

export function getById(store: RootStore, id: string): SetPointSimpleBlock {
  const block = blockById(store, id);

  // force block type
  if (!block || block.type !== 'SetPointSimple') {
    throw new Error('Block is not a valid SetPointSimple');
  }

  return block;
}

export function getAll(store: RootStore, serviceId: string): SetPointSimpleBlock[] {
  return allBlockFromService(store, serviceId)
    .filter(block => block.type === 'SetPointSimple') as SetPointSimpleBlock[];
}
