import { blockById } from '@/plugins/spark/store/getters';
import { RootStore } from '@/store/state';
import { InactiveObjectBlock } from './state';

export const typeName = 'InactiveObject';

export const getById =
  (store: RootStore, serviceId: string, id: string): InactiveObjectBlock =>
    blockById<InactiveObjectBlock>(store, serviceId, id, typeName);
