import { RootStore } from '@/store/state';

import { allBlocks, blockById } from '@/services/Spark/store/getters';

import { PidBlock } from './state';

export const typeName = 'Pid';

export const getById = (store: RootStore, serviceId: string, id: string) =>
  blockById<PidBlock>(store, serviceId, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocks<PidBlock>(store, serviceId, typeName);
