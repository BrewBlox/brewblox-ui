import { RootStore } from '@/store/state';

import { allBlocks, blockById } from '@/services/Spark/store/getters';

import { OneWireTempSensorBlock } from './state';

export const typeName = 'OneWireTempSensor';

export const getById = (store: RootStore, serviceId: string, id: string) =>
  blockById<OneWireTempSensorBlock>(store, serviceId, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocks<OneWireTempSensorBlock>(store, serviceId, typeName);
