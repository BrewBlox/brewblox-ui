import {
  AnalogConstraintKey,
  BlockIntfType,
  BlockType,
  DigitalConstraintKey,
  DisplayTempUnit,
  FilterChoice,
  SensorCombiFunc,
} from './types';

export const sparkType = 'Spark';
export const systemGroup = 7;

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
  SetpointSensorPairInterface: [BlockType.SetpointSensorPair],
  ActuatorAnalogInterface: [
    BlockType.ActuatorAnalogMock,
    BlockType.ActuatorOffset,
    BlockType.ActuatorPwm,
  ],
  ActuatorDigitalInterface: [BlockType.DigitalActuator, BlockType.MotorValve],
  BalancerInterface: [BlockType.Balancer],
  MutexInterface: [BlockType.Mutex],
  OneWireBusInterface: [BlockType.OneWireGpioModule],
  OneWireDeviceInterface: [
    BlockType.TempSensorOneWire,
    BlockType.DS2408,
    BlockType.DS2413,
  ],
  IoModuleInterface: [],
  IoArrayInterface: [
    BlockType.DS2408,
    BlockType.DS2413,
    BlockType.Spark2Pins,
    BlockType.Spark3Pins,
    BlockType.OneWireGpioModule,
    BlockType.MockPins,
  ],
  DS2408Interface: [BlockType.DS2408],
};

const ioChannelNamesBasic: Record<number, string> = {
  1: 'A',
  2: 'B',
  3: 'C',
  4: 'D',
  5: 'E',
  6: 'F',
  7: 'G',
  8: 'H',
};

export const ioChannelNamesDS2408 = ioChannelNamesBasic;

export const valveChannelNamesDS2408: Record<number, string> = {
  1: 'B',
  5: 'A',
};

export const ioChannelNamesDS2413: Record<number, string> = {
  1: 'A',
  2: 'B',
};

export const ioChannelNamesMockPins = ioChannelNamesBasic;

export const ioChannelNamesSpark2: Record<number, string> = {
  1: 'Bottom 1',
  2: 'Bottom 2',
  3: 'Bottom 3',
  4: 'Bottom 4',
};

export const ioChannelNamesSpark3: Record<number, string> = {
  1: 'Top 1',
  2: 'Top 2',
  3: 'Top 3',
  4: 'Bottom 1',
  5: 'Bottom 2',
};
