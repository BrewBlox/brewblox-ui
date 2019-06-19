import sparkStore from '@/plugins/spark/store';

import { ActuatorPwmBlock } from './types';

export const typeName = 'ActuatorPwm';

export const getById =
  (serviceId: string, id: string): ActuatorPwmBlock =>
    sparkStore.blockById(serviceId, id, typeName);
