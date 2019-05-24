import sparkStore from '@/plugins/spark/store';

import { SetpointProfileBlock } from './types';

export const typeName = 'SetpointProfile';

export const getById =
  (serviceId: string, id: string): SetpointProfileBlock =>
    sparkStore.blockById(serviceId, id, typeName);
