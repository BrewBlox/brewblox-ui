import { WidgetRole } from '@/store/features';

import {
  AnalogConstraintKey,
  BlockIntfType,
  BlockType,
  ChannelMapping,
  DigitalConstraintKey,
  FilterChoice,
  UserUnitKey,
} from './types';

export const sparkType = 'Spark';
export const sparkStateEvent = 'Spark.state';
export const sparkUpdateEvent = 'Spark.update';
export const systemGroup = 7;

export const roleIcons: Record<WidgetRole, string> = {
  Display: 'mdi-monitor-dashboard',
  Process: 'mdi-thermometer',
  Control: 'mdi-calculator-variant',
  Output: 'mdi-power-plug',
  Constraint: 'mdi-lock-outline',
  Other: 'mdi-cube',
};

export const userUnitChoices: Record<UserUnitKey, string[]> = {
  Temp: [
    'degC',
    'degF',
  ],
};

export const digitalConstraintLabels: Record<DigitalConstraintKey, string> = {
  minOff: 'Minimum OFF time',
  minOn: 'Minimum ON time',
  mutexed: 'Mutually exclusive',
  delayedOff: 'Delay OFF',
  delayedOn: 'Delay ON',
};

export const analogConstraintLabels: Record<AnalogConstraintKey, string> = {
  min: 'Minimum',
  max: 'Maximum',
  balanced: 'Balanced',
};

export const DS2408StartChannels: ChannelMapping[] = [
  { id: 'A', nid: 1, name: 'B' },
  { id: 'E', nid: 5, name: 'A' },
];

export const constraintLabels = {
  ...digitalConstraintLabels,
  ...analogConstraintLabels,
};

export const filterLabels: Record<FilterChoice, string> = {
  'FILTER_NONE': 'No filtering',
  'FILTER_15s': 'Filter 15s',
  'FILTER_45s': 'Filter 45s',
  'FILTER_90s': 'Filter 90s',
  'FILTER_3m': 'Filter 3m',
  'FILTER_10m': 'Filter 10m',
  'FILTER_30m': 'Filter 30m',
};

export const compatibleTypes: Record<BlockIntfType, BlockType[]> = {
  ProcessValueInterface: [
    'ActuatorAnalogMock',
    'ActuatorPwm',
    'SetpointSensorPair',
  ],
  TempSensorInterface: [
    'TempSensorMock',
    'TempSensorOneWire',
  ],
  SetpointSensorPairInterface: [
    'SetpointSensorPair',
  ],
  ActuatorAnalogInterface: [
    'ActuatorAnalogMock',
    'ActuatorOffset',
    'ActuatorPwm',
  ],
  ActuatorDigitalInterface: [
    'DigitalActuator',
    'MotorValve',
  ],
  BalancerInterface: [
    'Balancer',
  ],
  MutexInterface: [
    'Mutex',
  ],
  OneWireDeviceInterface: [
    'TempSensorOneWire',
    'DS2408',
    'DS2413',
  ],
  IoArrayInterface: [
    'DS2408',
    'DS2413',
    'Spark2Pins',
    'Spark3Pins',
    'MockPins',
  ],
  DS2408Interface: [
    'DS2408',
  ],
};
