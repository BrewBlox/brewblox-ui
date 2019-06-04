import sparkStore from '@/plugins/spark/store';

import { DS2413Block } from './types';

export const typeName = 'DS2413';

export const getById =
  (serviceId: string, id: string): DS2413Block =>
    sparkStore.blockById(serviceId, id, typeName);
