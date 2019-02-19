import { blockById } from '@/plugins/spark/store/getters';
import { RootStore } from '@/store/state';
import { ActuatorPwmBlock } from './state';

export const typeName = 'ActuatorPwm';

export const getById =
  (store: RootStore, serviceId: string, id: string): ActuatorPwmBlock =>
    blockById<ActuatorPwmBlock>(store, serviceId, id, typeName);
