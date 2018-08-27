import { RootStore } from '../../state';

import { allBlocksFromService, blockById } from '../getters';

import { TicksBlock } from './Ticks';

export const typeName = 'Ticks';

export const getById = (store: RootStore, id: string) =>
  blockById<TicksBlock>(store, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocksFromService<TicksBlock>(store, serviceId, typeName);
