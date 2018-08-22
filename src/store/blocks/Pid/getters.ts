import { RootStore } from '../../state';

import { allBlockFromService, blockById } from '../getters';

import { PidBlock } from './Pid';

export const typeName = 'Pid';

export function getById(store: RootStore, id: string): PidBlock {
  return blockById(store, id, typeName) as PidBlock;
}

export function getAll(store: RootStore, serviceId: string): PidBlock[] {
  return allBlockFromService(store, serviceId)
    .filter(block => block.type === typeName) as PidBlock[];
}
