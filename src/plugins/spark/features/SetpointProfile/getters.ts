import { blockById } from '@/plugins/spark/store/getters';
import { RootStore } from '@/store/state';
import { SetpointProfileBlock } from './state';

export const typeName = 'SetpointProfile';

export const getById = (store: RootStore, serviceId: string, id: string) =>
  blockById<SetpointProfileBlock>(store, serviceId, id, typeName);
