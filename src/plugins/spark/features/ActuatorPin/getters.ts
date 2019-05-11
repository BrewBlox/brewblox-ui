import sparkStore from '@/plugins/spark/store';
import { ActuatorPinBlock } from './types';

export const typeName = 'ActuatorPin';

export const state = [
  'Inactive',
  'Active',
  'Unknown',
];

export const getById =
  (serviceId: string, id: string): ActuatorPinBlock =>
    sparkStore.blockById(serviceId, id, typeName);
