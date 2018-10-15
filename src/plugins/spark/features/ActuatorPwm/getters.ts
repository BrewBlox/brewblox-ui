import { RootStore } from '@/store/state';
import { blockById } from '@/plugins/spark/store/getters';
import { ActuatorPwmBlock } from './state';

export const typeName = 'ActuatorPwm';

export const getById = (store: RootStore, serviceId: string, id: string) =>
  blockById<ActuatorPwmBlock>(store, serviceId, id, typeName);
