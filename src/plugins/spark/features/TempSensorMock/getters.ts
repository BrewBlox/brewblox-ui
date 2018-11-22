import { blockById } from '@/plugins/spark/store/getters';
import { RootStore } from '@/store/state';
import { TempSensorMockBlock } from './state';

export const typeName = 'TempSensorMock';

export const getById = (store: RootStore, serviceId: string, id: string) =>
  blockById<TempSensorMockBlock>(store, serviceId, id, typeName);
