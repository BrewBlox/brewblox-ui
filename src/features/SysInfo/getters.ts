import { RootStore } from '@/store/state';

import { allBlocksFromService, blockById } from '@/store/blocks/getters';

import { SysInfoBlock } from './state';

export const typeName = 'SysInfo';

export const getById = (store: RootStore, id: string) =>
  blockById<SysInfoBlock>(store, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocksFromService<SysInfoBlock>(store, serviceId, typeName);
