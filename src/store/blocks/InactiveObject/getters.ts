import { RootStore } from '../../state';

import { allBlocksFromService, blockById } from '../getters';

import { InactiveObjectBlock } from './InactiveObject';

export const typeName = 'InactiveObject';

export const getById = (store: RootStore, id: string) =>
  blockById<InactiveObjectBlock>(store, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocksFromService<InactiveObjectBlock>(store, serviceId, typeName);
