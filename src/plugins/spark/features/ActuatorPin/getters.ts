import sparkStore from '@/plugins/spark/store';
import { ActuatorPinBlock } from './state';

export const typeName = 'ActuatorPin';

export const state = [
  'Inactive',
  'Active',
  'Unknown',
];

export const getById =
  (serviceId: string, id: string): ActuatorPinBlock =>
    sparkStore.blockById(serviceId, id, typeName);
