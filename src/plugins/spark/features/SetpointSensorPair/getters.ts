import { allBlocks, blockById } from '@/plugins/spark/store/getters';
import { RootStore } from '@/store/state';
import { SetpointSensorPairBlock } from './state';

export const typeName = 'SetpointSensorPair';

export const getById = (store: RootStore, serviceId: string, id: string) =>
  blockById<SetpointSensorPairBlock>(store, serviceId, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocks<SetpointSensorPairBlock>(store, serviceId, typeName);
