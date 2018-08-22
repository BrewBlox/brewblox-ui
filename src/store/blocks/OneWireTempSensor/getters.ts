import { RootStore } from '../../state';

import { allBlocksFromService, blockById } from '../getters';

import { OneWireTempSensorBlock } from './OneWireTempSensor';

export const typeName = 'OneWireTempSensor';

export const getById = (store: RootStore, id: string) =>
  blockById<OneWireTempSensorBlock>(store, id, typeName);

export const getAll = (store: RootStore, serviceId: string) =>
  allBlocksFromService<OneWireTempSensorBlock>(store, serviceId, typeName);
