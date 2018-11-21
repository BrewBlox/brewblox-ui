import { allBlocks, blockById } from '@/plugins/spark/store/getters';
import { RootStore } from '@/store/state';
import { SetpointSimpleBlock } from './state';

export const typeName = 'SetpointSimple';

export const getById = (store: RootStore, serviceId: string, id: string) =>
  blockById<SetpointSimpleBlock>(store, serviceId, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocks<SetpointSimpleBlock>(store, serviceId, typeName);
