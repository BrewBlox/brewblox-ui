import { RootStore } from '@/store/state';
import { blockById } from '@/plugins/spark/store/getters';
import { MutexBlock } from './state';

export const typeName = 'Mutex';

export const getById = (store: RootStore, serviceId: string, id: string) =>
  blockById<MutexBlock>(store, serviceId, id, typeName);
