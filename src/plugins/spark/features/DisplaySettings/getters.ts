import sparkStore from '@/plugins/spark/store';
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
  (serviceId: string, id: string): DisplaySettingsBlock =>
    sparkStore.blockById(serviceId, id, typeName);
