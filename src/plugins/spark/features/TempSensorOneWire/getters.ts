import sparkStore from '@/plugins/spark/store';
import { TempSensorOneWireBlock } from './state';

export const typeName = 'TempSensorOneWire';

export const getById =
  (serviceId: string, id: string): TempSensorOneWireBlock =>
    sparkStore.blockById(serviceId, id, typeName);
