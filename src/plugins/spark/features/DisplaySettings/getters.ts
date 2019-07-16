import { sparkStore } from '@/plugins/spark/store';

import { DisplaySettingsBlock } from './types';

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
