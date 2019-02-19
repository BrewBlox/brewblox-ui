import { blockById } from '@/plugins/spark/store/getters';
import { RootStore } from '@/store/state';
import { ActuatorAnalogMockBlock } from './state';

export const typeName = 'ActuatorAnalogMock';

export const getById =
  (store: RootStore, serviceId: string, id: string): ActuatorAnalogMockBlock =>
    blockById<ActuatorAnalogMockBlock>(store, serviceId, id, typeName);
