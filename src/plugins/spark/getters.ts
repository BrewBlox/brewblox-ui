import { WidgetRole } from '@/store/features';

import {
  AnalogConstraintKey,
  BlockIntfType,
  BlockType,
  ChannelMapping,
  DigitalConstraintKey,
  DisplayTempUnit,
  FilterChoice,
  SensorCombiFunc,
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
  [FilterChoice.FILTER_NONE]: 'No filtering',
  [FilterChoice.FILTER_15s]: 'Filter 15s',
  [FilterChoice.FILTER_45s]: 'Filter 45s',
  [FilterChoice.FILTER_90s]: 'Filter 90s',
  [FilterChoice.FILTER_3m]: 'Filter 3m',
  [FilterChoice.FILTER_10m]: 'Filter 10m',
  [FilterChoice.FILTER_30m]: 'Filter 30m',
};

export const combineFuncLabels: Record<SensorCombiFunc, string> = {
  [SensorCombiFunc.SENSOR_COMBI_FUNC_AVG]: 'Average',
  [SensorCombiFunc.SENSOR_COMBI_FUNC_MIN]: 'Minimum',
  [SensorCombiFunc.SENSOR_COMBI_FUNC_MAX]: 'Maximum',
};

export const displayTempLabels: Record<DisplayTempUnit, string> = {
  [DisplayTempUnit.TEMP_CELSIUS]: 'Celsius',
  [DisplayTempUnit.TEMP_FAHRENHEIT]: 'Fahrenheit',
};

export const compatibleTypes: Record<BlockIntfType, BlockType[]> = {
  ProcessValueInterface: [
    BlockType.ActuatorAnalogMock,
    BlockType.ActuatorPwm,
    BlockType.SetpointSensorPair,
  ],
  TempSensorInterface: [
    BlockType.TempSensorCombi,
    BlockType.TempSensorMock,
    BlockType.TempSensorOneWire,
  ],
  SetpointSensorPairInterface: [
    BlockType.SetpointSensorPair,
  ],
  ActuatorAnalogInterface: [
    BlockType.ActuatorAnalogMock,
    BlockType.ActuatorOffset,
    BlockType.ActuatorPwm,
  ],
  ActuatorDigitalInterface: [
    BlockType.DigitalActuator,
    BlockType.MotorValve,
  ],
  BalancerInterface: [
    BlockType.Balancer,
  ],
  MutexInterface: [
    BlockType.Mutex,
  ],
  OneWireDeviceInterface: [
    BlockType.TempSensorOneWire,
    BlockType.DS2408,
    BlockType.DS2413,
  ],
  IoArrayInterface: [
    BlockType.DS2408,
    BlockType.DS2413,
    BlockType.Spark2Pins,
    BlockType.Spark3Pins,
    BlockType.MockPins,
  ],
  DS2408Interface: [
    BlockType.DS2408,
  ],
};
