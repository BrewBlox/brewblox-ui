import sparkStore from '@/plugins/spark/store';

import { InactiveObjectBlock } from './types';

export const typeName = 'InactiveObject';

export const getById =
  (serviceId: string, id: string): InactiveObjectBlock =>
    sparkStore.blockById(serviceId, id, typeName);
