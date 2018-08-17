import { RootStore } from '../../state';

import { allBlockFromService, blockById } from '../getters';

import { SetPointSimpleBlock } from './SetPointSimple';

export const typeName = 'SetPointSimple';

export function getById(store: RootStore, id: string): SetPointSimpleBlock {
  return blockById(store, id, typeName) as SetPointSimpleBlock;
}

export function getAll(store: RootStore, serviceId: string): SetPointSimpleBlock[] {
  return allBlockFromService(store, serviceId)
    .filter(block => block.type === typeName) as SetPointSimpleBlock[];
}
