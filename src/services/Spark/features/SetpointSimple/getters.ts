import { RootStore } from '@/store/state';
import { allBlocks, blockById } from '@/services/Spark/store/getters';
import { SetpointSimpleBlock } from './state';

export const typeName = 'SetpointSimple';

export const getById = (store: RootStore, serviceId: string, id: string) =>
  blockById<SetpointSimpleBlock>(store, serviceId, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocks<SetpointSimpleBlock>(store, serviceId, typeName);
