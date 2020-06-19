import { WidgetRole } from '@/store/features';

import {
  AnalogConstraintKey,
  BlockInterfaceType,
  BlockType,
  ChannelMapping,
  DigitalConstraintKey,
  SystemBlockType,
  UserBlockType,
  UserUnitKey,
} from './types';

export const sparkType = 'Spark';
export const sparkBlocksEvent = 'Spark.blocks';
export const sparkStatusEvent = 'Spark.service';
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

export const systemBlockTypes: Record<SystemBlockType, SystemBlockType> = {
  SysInfo: 'SysInfo',
  Groups: 'Groups',
  OneWireBus: 'OneWireBus',
  Ticks: 'Ticks',
  WiFiSettings: 'WiFiSettings',
  TouchSettings: 'TouchSettings',
};

export const blockTypes: Record<UserBlockType, UserBlockType> = {
  ActuatorAnalogMock: 'ActuatorAnalogMock',
  ActuatorLogic: 'ActuatorLogic',
  ActuatorOffset: 'ActuatorOffset',
  ActuatorPwm: 'ActuatorPwm',
  Balancer: 'Balancer',
  DeprecatedObject: 'DeprecatedObject',
  DigitalActuator: 'DigitalActuator',
  DisplaySettings: 'DisplaySettings',
  DS2408: 'DS2408',
  DS2413: 'DS2413',
  InactiveObject: 'InactiveObject',
  MockPins: 'MockPins',
  MotorValve: 'MotorValve',
  Mutex: 'Mutex',
  Pid: 'Pid',
  SetpointProfile: 'SetpointProfile',
  SetpointSensorPair: 'SetpointSensorPair',
  Spark2Pins: 'Spark2Pins',
  Spark3Pins: 'Spark3Pins',
  TempSensorMock: 'TempSensorMock',
  TempSensorOneWire: 'TempSensorOneWire',
};

export const interfaceTypes: Record<string, BlockInterfaceType> = {
  ProcessValue: 'ProcessValueInterface',
  TempSensor: 'TempSensorInterface',
  SetpointSensorPair: 'SetpointSensorPairInterface',
  ActuatorAnalog: 'ActuatorAnalogInterface',
  ActuatorDigital: 'ActuatorDigitalInterface',
  Balancer: 'BalancerInterface',
  IoArray: 'IoArrayInterface',
};

export const compatibleTypes: Record<BlockInterfaceType, BlockType[]> = {
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
