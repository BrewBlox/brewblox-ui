import {
  AnalogConstraintKey,
  BlockInterfaceType,
  BlockType,
  ChannelConfig,
  DigitalConstraintKey,
  SystemBlockType,
  UserUnitKey,
} from './types';

export const sparkType = 'Spark';
export const sparkBlocksEvent = 'Spark.blocks';
export const sparkStatusEvent = 'Spark.service';
export const sparkUpdateEvent = 'Spark.update';

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

export const constraintLabels = {
  ...digitalConstraintLabels,
  ...analogConstraintLabels,
};

export const configName = (val: ChannelConfig): string => ChannelConfig[val];


export const systemBlockTypes: Record<string, SystemBlockType> = {
  SysInfo: 'SysInfo',
  Groups: 'Groups',
  OneWireBus: 'OneWireBus',
  Ticks: 'Ticks',
  WiFiSettings: 'WifiSettings',
  TouchSettings: 'TouchSettings',
};

export const blockTypes: Record<string, SystemBlockType | BlockType> = {
  ActuatorAnalogMock: 'ActuatorAnalogMock',
  ActuatorLogic: 'ActuatorLogic',
  SetpointDriver: 'ActuatorOffset',
  ActuatorPwm: 'ActuatorPwm',
  Balancer: 'Balancer',
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
