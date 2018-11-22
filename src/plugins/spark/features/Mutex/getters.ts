import { blockById } from '@/plugins/spark/store/getters';
import { RootStore } from '@/store/state';
import { MutexBlock } from './state';

export const typeName = 'Mutex';

export const getById = (store: RootStore, serviceId: string, id: string) =>
  blockById<MutexBlock>(store, serviceId, id, typeName);
