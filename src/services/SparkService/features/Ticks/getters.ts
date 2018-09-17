import { RootStore } from '@/store/state';

import { allBlocksFromService, blockById } from '@/services/SparkService/store/getters';

import { TicksBlock } from './state';

export const typeName = 'Ticks';

export const getById = (store: RootStore, id: string) =>
  blockById<TicksBlock>(store, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocksFromService<TicksBlock>(store, serviceId, typeName);
