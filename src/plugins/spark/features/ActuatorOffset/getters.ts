import { sparkStore } from '@/plugins/spark/store';

import { ActuatorOffsetBlock } from './types';

export const typeName = 'ActuatorOffset';

export const getById =
  (serviceId: string, id: string): ActuatorOffsetBlock =>
    sparkStore.blockById(serviceId, id, typeName);
