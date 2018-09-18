import { RootStore } from '@/store/state';

import { allBlocks, blockById } from '@/services/spark/store/getters';

import { SysInfoBlock } from './state';

export const typeName = 'SysInfo';

export const getById = (store: RootStore, serviceId: string, id: string) =>
  blockById<SysInfoBlock>(store, serviceId, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocks<SysInfoBlock>(store, serviceId, typeName);
