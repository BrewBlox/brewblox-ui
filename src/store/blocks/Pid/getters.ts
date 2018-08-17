import { allBlockFromService, blockById } from '../getters';

import { PidBlock, typeName } from '@/store/blocks/Pid/Pid';

import { RootStore } from '../../state';

export function getById(store: RootStore, id: string): PidBlock {
  return blockById(store, id, typeName) as PidBlock;
}

export function getAll(store: RootStore, serviceId: string): PidBlock[] {
  return allBlockFromService(store, serviceId)
    .filter(block => block.type === 'Pid') as PidBlock[];
}
