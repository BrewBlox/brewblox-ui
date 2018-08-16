import { allBlockFromService, blockById } from '../getters';

import { PidBlock } from './PID';

import { RootStore } from '../../state';

export function getById(store: RootStore, id: string): PidBlock {
  const block = blockById(store, id);

  // force block type
  if (!block || block.type !== 'Pid') {
    throw new Error('Block is not a valid Pid');
  }

  return block as PidBlock;
}

export function getAll(store: RootStore, serviceId: string): PidBlock[] {
  return allBlockFromService(store, serviceId)
    .filter(block => block.type === 'Pid') as PidBlock[];
}
