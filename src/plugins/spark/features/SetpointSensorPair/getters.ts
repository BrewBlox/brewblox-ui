import sparkStore from '@/plugins/spark/store';

import { SetpointSensorPairBlock } from './types';

export const typeName = 'SetpointSensorPair';

export const getById =
  (serviceId: string, id: string): SetpointSensorPairBlock =>
    sparkStore.blockById(serviceId, id, typeName);
