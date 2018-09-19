import { RootStore } from '@/store/state';

import { allBlocks, blockById } from '@/services/Spark/store/getters';

import { OneWireBusBlock } from './state';

export const typeName = 'OneWireBus';

export const getById = (store: RootStore, serviceId: string, id: string) =>
  blockById<OneWireBusBlock>(store, serviceId, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocks<OneWireBusBlock>(store, serviceId, typeName);
