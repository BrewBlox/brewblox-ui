import { RootStore } from '@/store/state';

import { allBlocks, blockById } from '@/services/Spark/store/getters';

import { TicksBlock } from './state';

export const typeName = 'Ticks';

export const getById = (store: RootStore, serviceId: string, id: string) =>
  blockById<TicksBlock>(store, serviceId, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocks<TicksBlock>(store, serviceId, typeName);
