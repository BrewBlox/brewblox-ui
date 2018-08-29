import { RootStore } from '@/store/state';

import { allBlocksFromService, blockById } from '@/store/blocks/getters';

import { PidBlock } from './state';

export const typeName = 'Pid';

export const getById = (store: RootStore, id: string) =>
  blockById<PidBlock>(store, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocksFromService<PidBlock>(store, serviceId, typeName);
