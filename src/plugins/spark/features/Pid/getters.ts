import sparkStore from '@/plugins/spark/store';

import { PidBlock } from './types';

export const typeName = 'Pid';

export const filters = [
  '30s',
  '1m',
  '3m',
  '5m',
  '10m',
  '20m',
  '45m',
];

export const getById =
  (serviceId: string, id: string): PidBlock =>
    sparkStore.blockById(serviceId, id, typeName);
