import { RootStore } from '@/store/state';

import { allBlocksFromService, blockById } from '@/services/spark/store/getters';

import { InactiveObjectBlock } from './state';

export const typeName = 'InactiveObject';

export const getById = (store: RootStore, id: string) =>
  blockById<InactiveObjectBlock>(store, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocksFromService<InactiveObjectBlock>(store, serviceId, typeName);
