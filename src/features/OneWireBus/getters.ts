import { RootStore } from '@/store/state';

import { allBlocksFromService, blockById } from '@/store/blocks/getters';

import { OneWireBusBlock } from './state';

export const typeName = 'OneWireBus';

export const getById = (store: RootStore, id: string) =>
  blockById<OneWireBusBlock>(store, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocksFromService<OneWireBusBlock>(store, serviceId, typeName);
