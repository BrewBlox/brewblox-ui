import { Enum } from 'typescript-string-enums';

// Note for maintainers:
// If you get the error "'MyEnum' refers to a value, but is used as a type here",
// you need to add a type definition at the bottom of this file:
//
//   export type MyEnum = Enum<typeof MyEnum>;
//

// #region BlockIntfType
export const BlockIntfType = Enum(
  'ProcessValueInterface',
  'TempSensorInterface',
  'SetpointSensorPairInterface',
  'ActuatorAnalogInterface',
  'ActuatorDigitalInterface',
  'BalancerInterface',
  'MutexInterface',
  'OneWireBusInterface',
  'OneWireDeviceInterface',
  'IoModuleInterface',
  'IoArrayInterface',
  'DS2408Interface',
  'EnablerInterface',
);
// #endregion BlockIntfType

// #region BlockType
export const SystemBlockType = Enum(
  'DisplaySettings',
  'OneWireBus',
  'SysInfo',
  'Ticks',
  'TouchSettings',
  'WiFiSettings',
  'Spark2Pins',
  'Spark3Pins',
  'OneWireGpioModule',
);

export const UserBlockType = Enum(
  'ActuatorAnalogMock',
  'ActuatorLogic',
  'ActuatorOffset',
  'ActuatorPwm',
  'Balancer',
  'DeprecatedObject',
  'DigitalActuator',
  'DS2408',
  'DS2413',
  'InactiveObject',
  'MockPins',
  'MotorValve',
  'Mutex',
  'Pid',
  'Sequence',
  'SetpointProfile',
  'SetpointSensorPair',
  'TempSensorCombi',
  'TempSensorExternal',
  'TempSensorMock',
  'TempSensorOneWire',
);

export const BlockType = Enum(
  ...Enum.values(SystemBlockType),
  ...Enum.values(UserBlockType),
);
// #endregion BlockType

export const BlockOrIntfType = Enum(
  ...Enum.values(BlockType),
  ...Enum.values(BlockIntfType),
);

// #region COMPATIBLE_TYPES
export const COMPATIBLE_TYPES: Record<BlockIntfType, BlockType[]> = {
  ProcessValueInterface: [
    BlockType.ActuatorAnalogMock,
    BlockType.ActuatorPwm,
    BlockType.SetpointSensorPair,
  ],
  TempSensorInterface: [
    BlockType.TempSensorCombi,
    BlockType.TempSensorExternal,
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
  EnablerInterface: [
    BlockType.ActuatorOffset,
    BlockType.ActuatorLogic,
    BlockType.Pid,
    BlockType.Sequence,
    BlockType.ActuatorPwm,
    BlockType.SetpointSensorPair,
    BlockType.SetpointProfile,
    BlockType.TempSensorExternal,
  ],
};
// #endregion COMPATIBLE_TYPES

export const DigitalConstraintKey = Enum(
  'mutexed',
  'minOff',
  'minOn',
  'delayedOff',
  'delayedOn',
);

export const AnalogConstraintKey = Enum('min', 'max', 'balanced');

export const AnyConstraintKey = Enum(
  ...Enum.values(DigitalConstraintKey),
  ...Enum.values(AnalogConstraintKey),
);

// #region Gpio
export const GpioDeviceType = Enum(
  'GPIO_DEV_NONE',
  'GPIO_DEV_SSR_2P',
  'GPIO_DEV_SSR_1P',
  'GPIO_DEV_MECHANICAL_RELAY_2P',
  'GPIO_DEV_MECHANICAL_RELAY_1P_HIGH_SIDE',
  'GPIO_DEV_MECHANICAL_RELAY_1P_LOW_SIDE',
  'GPIO_DEV_COIL_2P',
  'GPIO_DEV_COIL_2P_BIDIRECTIONAL',
  'GPIO_DEV_COIL_1P_HIGH_SIDE',
  'GPIO_DEV_COIL_1P_LOW_SIDE',
  'GPIO_DEV_MOTOR_2P',
  'GPIO_DEV_MOTOR_2P_BIDIRECTIONAL',
  'GPIO_DEV_MOTOR_1P_HIGH_SIDE',
  'GPIO_DEV_MOTOR_1P_LOW_SIDE',
  'GPIO_DEV_LOAD_DETECT_2P',
  'GPIO_DEV_LOAD_DETECT_1P_PULL_DOWN',
  'GPIO_DEV_LOAD_DETECT_1P_PULL_UP',
  'GPIO_DEV_POWER_1P',
  'GPIO_DEV_POWER_1P_LOAD_DETECT',
  'GPIO_DEV_GND_1P',
  'GPIO_DEV_GND_1P_LOAD_DETECT',
);

export enum GpioPins {
  NONE = 0,
  PIN_1 = 1 << 0,
  PIN_2 = 1 << 1,
  PIN_3 = 1 << 2,
  PIN_4 = 1 << 3,
  PIN_5 = 1 << 4,
  PIN_6 = 1 << 5,
  PIN_7 = 1 << 6,
  PIN_8 = 1 << 7,
}

export enum GpioModuleStatus {
  NONE = 0,
  POWER_ON_RESET = 1 << 0,
  OVERVOLTAGE = 1 << 1,
  UNDERVOLTAGE_LOCKOUT = 1 << 2,
  OVERCURRENT = 1 << 3,
  OPEN_LOAD = 1 << 4,
  OVERTEMPERATURE_WARNING = 1 << 5,
  OVERTEMPERATURE_SHUTDOWN = 1 << 6,
}
// #endregion Gpio

// #region DigitalState
export const DigitalState = Enum(
  'STATE_INACTIVE',
  'STATE_ACTIVE',
  'STATE_UNKNOWN',
  'STATE_REVERSE',
);
// #endregion DigitalState

// #region Logic
export const DigitalCompareOp = Enum(
  'OP_VALUE_IS',
  'OP_VALUE_IS_NOT',
  'OP_DESIRED_IS',
  'OP_DESIRED_IS_NOT',
);

export const AnalogCompareOp = Enum(
  'OP_VALUE_LE',
  'OP_VALUE_GE',
  'OP_SETTING_LE',
  'OP_SETTING_GE',
);

export const LogicResult = Enum(
  'RESULT_FALSE',
  'RESULT_TRUE',
  'RESULT_EMPTY',
  'RESULT_EMPTY_SUBSTRING',
  'RESULT_BLOCK_NOT_FOUND',
  'RESULT_INVALID_DIGITAL_OP',
  'RESULT_INVALID_ANALOG_OP',
  'RESULT_UNDEFINED_DIGITAL_COMPARE',
  'RESULT_UNDEFINED_ANALOG_COMPARE',
  'RESULT_UNEXPECTED_OPEN_BRACKET',
  'RESULT_UNEXPECTED_CLOSE_BRACKET',
  'RESULT_UNEXPECTED_CHARACTER',
  'RESULT_UNEXPECTED_COMPARISON',
  'RESULT_UNEXPECTED_OPERATOR',
  'RESULT_MISSING_CLOSE_BRACKET',
);
// #endregion Logic

// #region ReferenceKind
export const ReferenceKind = Enum('REF_SETTING', 'REF_VALUE');
// #endregion ReferenceKind

// #region DisplayTempUnit
export const DisplayTempUnit = Enum('TEMP_CELSIUS', 'TEMP_FAHRENHEIT');
// #endregion DisplayTempUnit

// #region DS2408ConnectMode
export const DS2408ConnectMode = Enum('CONNECT_VALVE', 'CONNECT_ACTUATOR');
// #endregion DS2408ConnectMode

// #region ValveState
export const ValveState = Enum(
  'VALVE_UNKNOWN',
  'VALVE_OPEN',
  'VALVE_CLOSED',
  'VALVE_OPENING',
  'VALVE_CLOSING',
  'VALVE_HALF_OPEN_IDLE',
  'VALVE_INIT_IDLE',
);
// #endregion ValveState

// #region FilterChoice
export const FilterChoice = Enum(
  'FILTER_NONE',
  'FILTER_15s',
  'FILTER_45s',
  'FILTER_90s',
  'FILTER_3m',
  'FILTER_10m',
  'FILTER_30m',
);
// #endregion FilterChoice

// #region SensorCombiFunc
export const SensorCombiFunc = Enum(
  'SENSOR_COMBI_FUNC_AVG',
  'SENSOR_COMBI_FUNC_MIN',
  'SENSOR_COMBI_FUNC_MAX',
);
// #endregion SensorCombiFunc

// #region SequenceStatus
export const SequenceStatus = Enum(
  'UNKNOWN',
  'DISABLED',
  'PAUSED',
  'NEXT',
  'WAITING',
  'END',
  'RESTART',
  'ERROR',
);
// #endregion SequenceStatus

// #region SequenceError
export const SequenceError = Enum(
  'NONE',
  'INVALID_ARGUMENT',
  'INVALID_TARGET',
  'INACTIVE_TARGET',
  'DISABLED_TARGET',
  'SYSTEM_TIME_NOT_AVAILABLE',
);
// #endregion SequenceError

// #region Spark2Hardware
export const Spark2Hardware = Enum('HW_UNKNOWN', 'HW_SPARK1', 'HW_SPARK2');
// #endregion Spark2Hardware

// #region SparkPlatform
export const SparkPlatform = Enum(
  'PLATFORM_UNKNOWN',
  'PLATFORM_GCC',
  'PLATFORM_PHOTON',
  'PLATFORM_P1',
);
// #endregion SparkPlatform

// #region TouchCalibrated
export const TouchCalibrated = Enum(
  'CALIBRATED_NO',
  'CALIBRATED_YES',
  'CALIBRATED_NEW',
);
// #endregion TouchCalibrated

// #region

// #region Wifi
export const WifiSecurityType = Enum(
  'WLAN_SEC_UNSEC',
  'WLAN_SEC_WEP',
  'WLAN_SEC_WPA',
  'WLAN_SEC_WPA2',
  'WLAN_SEC_WPA_ENTERPRISE',
  'WLAN_SEC_WPA2_ENTERPRISE',
  'WLAN_SEC_NOT_SET',
);

export const WifiCipherType = Enum(
  'WLAN_CIPHER_NOT_SET',
  'WLAN_CIPHER_AES',
  'WLAN_CIPHER_TKIP',
  'WLAN_CIPHER_AES_OR_TKIP',
);
// #endregion Wifi

export type BlockIntfType = Enum<typeof BlockIntfType>;
export type SystemBlockType = Enum<typeof SystemBlockType>;
export type UserBlockType = Enum<typeof UserBlockType>;
export type BlockType = Enum<typeof BlockType>;
export type BlockOrIntfType = Enum<typeof BlockOrIntfType>;
export type DigitalConstraintKey = Enum<typeof DigitalConstraintKey>;
export type AnalogConstraintKey = Enum<typeof AnalogConstraintKey>;
export type AnyConstraintKey = Enum<typeof AnyConstraintKey>;
export type GpioDeviceType = Enum<typeof GpioDeviceType>;
export type DigitalState = Enum<typeof DigitalState>;
export type DigitalCompareOp = Enum<typeof DigitalCompareOp>;
export type AnalogCompareOp = Enum<typeof AnalogCompareOp>;
export type LogicResult = Enum<typeof LogicResult>;
export type ReferenceKind = Enum<typeof ReferenceKind>;
export type DisplayTempUnit = Enum<typeof DisplayTempUnit>;
export type DS2408ConnectMode = Enum<typeof DS2408ConnectMode>;
export type ValveState = Enum<typeof ValveState>;
export type FilterChoice = Enum<typeof FilterChoice>;
export type SensorCombiFunc = Enum<typeof SensorCombiFunc>;
export type SequenceStatus = Enum<typeof SequenceStatus>;
export type SequenceError = Enum<typeof SequenceError>;
export type Spark2Hardware = Enum<typeof Spark2Hardware>;
export type SparkPlatform = Enum<typeof SparkPlatform>;
export type TouchCalibrated = Enum<typeof TouchCalibrated>;
export type WifiSecurityType = Enum<typeof WifiSecurityType>;
export type WifiCipherType = Enum<typeof WifiCipherType>;
