import sparkStore from '@/plugins/spark/store';
import { ActuatorAnalogMockBlock } from './state';

export const typeName = 'ActuatorAnalogMock';

export const getById =
  (serviceId: string, id: string): ActuatorAnalogMockBlock =>
    sparkStore.blockById(serviceId, id, typeName);
