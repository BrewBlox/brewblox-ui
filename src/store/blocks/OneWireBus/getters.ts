import { RootStore } from '../../state';

import { allBlocksFromService, blockById } from '../getters';

import { OneWireBusBlock } from './OneWireBus';

export const typeName = 'OneWireBus';

export const getById = (store: RootStore, id: string) =>
  blockById<OneWireBusBlock>(store, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocksFromService<OneWireBusBlock>(store, serviceId, typeName);
