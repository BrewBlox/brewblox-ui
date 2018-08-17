import { allBlockFromService, blockById } from '../getters';

import { SetPointSimpleBlock, typeName } from './SetPointSimple';

import { RootStore } from '../../state';

export function getById(store: RootStore, id: string): SetPointSimpleBlock {
  return blockById(store, id, typeName) as SetPointSimpleBlock;
}

export function getAll(store: RootStore, serviceId: string): SetPointSimpleBlock[] {
  return allBlockFromService(store, serviceId)
    .filter(block => block.type === 'SetPointSimple') as SetPointSimpleBlock[];
}
