import { blockById } from '@/plugins/spark/store/getters';
import { RootStore } from '@/store/state';
import { SetpointSimpleBlock } from './state';

export const typeName = 'SetpointSimple';

export const getById =
  (store: RootStore, serviceId: string, id: string): SetpointSimpleBlock =>
    blockById<SetpointSimpleBlock>(store, serviceId, id, typeName);
