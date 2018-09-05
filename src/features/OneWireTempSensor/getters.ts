import { RootStore } from '@/store/state';

import { allBlocksFromService, blockById } from '@/store/blocks/getters';

import { OneWireTempSensorBlock } from './state';

export const typeName = 'OneWireTempSensor';

export const getById = (store: RootStore, id: string) =>
  blockById<OneWireTempSensorBlock>(store, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocksFromService<OneWireTempSensorBlock>(store, serviceId, typeName);
