import sparkStore from '@/plugins/spark/store';

import { TempSensorMockBlock } from './types';

export const typeName = 'TempSensorMock';

export const getById =
  (serviceId: string, id: string): TempSensorMockBlock =>
    sparkStore.blockById(serviceId, id, typeName);
