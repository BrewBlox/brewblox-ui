import { blockById } from '@/plugins/spark/store/getters';
import { RootStore } from '@/store/state';
import { TempSensorOneWireBlock } from './state';

export const typeName = 'TempSensorOneWire';

export const getById = (store: RootStore, serviceId: string, id: string) =>
  blockById<TempSensorOneWireBlock>(store, serviceId, id, typeName);
