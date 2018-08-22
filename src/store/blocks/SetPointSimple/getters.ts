import { RootStore } from '../../state';

import { allBlocksFromService, blockById } from '../getters';

import { SetPointSimpleBlock } from './SetPointSimple';

export const typeName = 'SetPointSimple';

export const getById = (store: RootStore, id: string) =>
  blockById<SetPointSimpleBlock>(store, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocksFromService<SetPointSimpleBlock>(store, serviceId, typeName);
