import { RootStore } from '@/store/state';

import { allBlocksFromService, blockById } from '@/services/spark/store/getters';

import { SetPointSimpleBlock } from './state';

export const typeName = 'SetPointSimple';

export const getById = (store: RootStore, id: string) =>
  blockById<SetPointSimpleBlock>(store, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocksFromService<SetPointSimpleBlock>(store, serviceId, typeName);
