import { RootStore } from '../../state';

import { allBlocksFromService, blockById } from '../getters';

import { PidBlock } from './Pid';

export const typeName = 'Pid';

export const getById = (store: RootStore, id: string) =>
  blockById<PidBlock>(store, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocksFromService<PidBlock>(store, serviceId, typeName);
