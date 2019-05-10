import sparkStore from '@/plugins/spark/store';
import { ActuatorDS2413Block } from './types';

export const typeName = 'ActuatorDS2413';

export const channel = [
  'Unset',
  'A',
  'B',
];

export const getById =
  (serviceId: string, id: string): ActuatorDS2413Block =>
    sparkStore.blockById(serviceId, id, typeName);
