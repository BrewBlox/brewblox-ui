import { RootStore } from '@/store/state';

import { allBlocks, blockById } from '@/plugins/spark/store/getters';

import { InactiveObjectBlock } from './state';

export const typeName = 'InactiveObject';

export const getById = (store: RootStore, serviceId: string, id: string) =>
  blockById<InactiveObjectBlock>(store, serviceId, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocks<InactiveObjectBlock>(store, serviceId, typeName);

export const testey = () => { };
