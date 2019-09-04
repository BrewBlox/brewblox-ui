import { sparkStore } from '@/plugins/spark/store';

import { PidBlock } from './types';

export const typeName = 'Pid';

export const getById =
  (serviceId: string, id: string): PidBlock =>
    sparkStore.blockById(serviceId, id, typeName);
