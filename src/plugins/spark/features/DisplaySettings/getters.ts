import { blockById } from '@/plugins/spark/store/getters';
import { RootStore } from '@/store/state';
import { DisplaySettingsBlock } from './state';

export const typeName = 'DisplaySettings';

export const validDisplayTypes = [
  'TempSensorMock',
  'TempSensorOneWire',
  'SetpointSensorPair',
  'ActuatorPwm',
  'ActuatorAnalogMock',
  'Pid',
];

export const getById =
  (store: RootStore, serviceId: string, id: string): DisplaySettingsBlock =>
    blockById<DisplaySettingsBlock>(store, serviceId, id, typeName);
