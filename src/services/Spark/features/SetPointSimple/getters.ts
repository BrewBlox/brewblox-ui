import { RootStore } from '@/store/state';
import { allBlocks, blockById } from '@/services/Spark/store/getters';
import { SetPointSimpleBlock } from './state';

export const typeName = 'SetPointSimple';

export const getById = (store: RootStore, serviceId: string, id: string) =>
  blockById<SetPointSimpleBlock>(store, serviceId, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocks<SetPointSimpleBlock>(store, serviceId, typeName);
