import { RootStore } from '@/store/state';

import { allBlocks, blockById } from '@/plugins/spark/store/getters';

import { TempSensorOneWireBlock } from './state';

export const typeName = 'TempSensorOneWire';

export const getById = (store: RootStore, serviceId: string, id: string) =>
  blockById<TempSensorOneWireBlock>(store, serviceId, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocks<TempSensorOneWireBlock>(store, serviceId, typeName);
