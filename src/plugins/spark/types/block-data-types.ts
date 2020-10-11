import { Enum } from 'typescript-string-enums';

import { Link, Unit } from '../units';
import { DigitalState, IoPin } from './block-shared';
import { Block } from './block-types';
import { AnalogConstraintsObj, DigitalConstraintsObj } from './constraint-types';

export interface ActuatorAnalogMockBlock extends Block {
  type: 'ActuatorAnalogMock';
  data: {
    setting: number;
    desiredSetting: number;
    minSetting: number;
    maxSetting: number;
    value: number;
    minValue: number;
    maxValue: number;
    constrainedBy: AnalogConstraintsObj;
  };
}

export const DigitalCompareOp = Enum(
  'OP_VALUE_IS',
  'OP_VALUE_IS_NOT',
  'OP_DESIRED_IS',
  'OP_DESIRED_IS_NOT'
);
export type DigitalCompareOp = Enum<typeof DigitalCompareOp>;

export const AnalogCompareOp = Enum(
  'OP_VALUE_LE',
  'OP_VALUE_GE',
  'OP_SETTING_LE',
  'OP_SETTING_GE',
);
export type AnalogCompareOp = Enum<typeof AnalogCompareOp>;

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
export type LogicResult = Enum<typeof LogicResult>;

export interface DigitalCompare {
  op: DigitalCompareOp;
  result: LogicResult;
  id: Link;
  rhs: DigitalState;
}

export interface AnalogCompare {
  op: AnalogCompareOp;
  result: LogicResult;
  id: Link;
  rhs: number;
}

export interface ExpressionError {
  index: number;
  message: string;
  indicator: string;
}

export interface ActuatorLogicBlock extends Block {
  type: 'ActuatorLogic';
  data: {
    enabled: boolean;
    result: LogicResult; // readonly
    errorPos: number; // readonly
    targetId: Link;
    drivenTargetId: Link; // readonly
    digital: DigitalCompare[];
    analog: AnalogCompare[];
    expression: string; // a-zA-Z&|^!()
  };
}

export const ReferenceKind = Enum(
  'REF_SETTING',
  'REF_VALUE',
);
export type ReferenceKind = Enum<typeof ReferenceKind>;

export interface ActuatorOffsetBlock extends Block {
  type: 'ActuatorOffset';
  data: {
    enabled: boolean;
    desiredSetting: number;
    referenceSettingOrValue: ReferenceKind;

    targetId: Link;
    drivenTargetId: Link;
    referenceId: Link;

    setting: number;
    value: number;

    constrainedBy: AnalogConstraintsObj;
  };
}

export interface ActuatorPwmBlock extends Block {
  type: 'ActuatorPwm';
  data: {
    actuatorId: Link;
    drivenActuatorId: Link;

    setting: number;
    desiredSetting: number;

    period: Unit;
    value: number;
    enabled: boolean;

    constrainedBy: AnalogConstraintsObj;
  };
}

export interface BalancedActuator {
  id: number;
  requested: number;
  granted: number;
}

export interface BalancerBlock extends Block {
  type: 'Balancer';
  data: {
    clients: BalancedActuator[];
  };
}

export interface DeprecatedObjectBlock extends Block {
  type: 'DeprecatedObject';
  data: {
    actualId: number;
  };
}

export interface DigitalActuatorBlock extends Block {
  type: 'DigitalActuator';
  data: {
    hwDevice: Link;
    channel: number;
    desiredState: DigitalState;
    state: DigitalState;
    invert: boolean;
    constrainedBy: DigitalConstraintsObj;
  };
}

export const DisplayTempUnit = Enum(
  'TEMP_CELSIUS',
  'TEMP_FAHRENHEIT',
);
export type DisplayTempUnit = Enum<typeof DisplayTempUnit>;

export interface DisplaySlot {
  pos: number;
  color: string;
  name: string;

  // Value will be one of these
  tempSensor?: Link;
  setpointSensorPair?: Link;
  actuatorAnalog?: Link;
  pid?: Link;
}

export interface DisplaySettingsBlock extends Block {
  type: 'DisplaySettings';
  data: {
    name: string;
    tempUnit: DisplayTempUnit;
    widgets: DisplaySlot[];
    brightness: number;
  };
}

export interface ChannelMapping {
  id: string;
  nid: number;
  name: string;
}

export interface DS2408Block extends Block {
  type: 'DS2408';
  data: {
    address: string;
    connected: boolean;
    pins: IoPin[];
  };
}

export interface DS2413Block extends Block {
  type: 'DS2413';
  data: {
    address: string;
    connected: boolean;
    pins: IoPin[];
  };
}

export interface InactiveObjectBlock extends Block {
  type: 'InactiveObject';
  data: {
    actualType: string;
  };
}

export interface GroupsBlock extends Block {
  type: 'Groups';
  data: {
    active: number[];
  };
}

export interface MockPinsBlock extends Block {
  type: 'MockPins';
  data: {
    pins: IoPin[];
  };
}

export const ValveState = Enum(
  'VALVE_UNKNOWN',
  'VALVE_OPEN',
  'VALVE_CLOSED',
  'VALVE_OPENING',
  'VALVE_CLOSING',
  'VALVE_HALF_OPEN_IDLE',
  'VALVE_INIT_IDLE',
);
export type ValveState = Enum<typeof ValveState>;

export interface MotorValveBlock extends Block {
  type: 'MotorValve';
  data: {
    hwDevice: Link;
    startChannel: number;
    desiredState: DigitalState;
    state: DigitalState;
    valveState: ValveState;
    constrainedBy: DigitalConstraintsObj;
  };
}

export interface MutexBlock extends Block {
  type: 'Mutex';
  data: {
    differentActuatorWait: Unit;
    waitRemaining: Unit;
  };
}

export interface OneWireBusBlock extends Block {
  type: 'OneWireBus';
  data: {
    command: {
      opcode: number;
      data: number;
    };
    address: string[];
  };
}

export interface PidBlock extends Block {
  type: 'Pid';
  data: {
    inputId: Link;
    outputId: Link;

    inputValue: Unit;
    inputSetting: Unit;
    outputValue: number;
    outputSetting: number;

    enabled: boolean;
    active: boolean;

    kp: Unit;
    ti: Unit;
    td: Unit;

    p: number;
    i: number;
    d: number;

    error: Unit;
    integral: Unit;
    derivative: Unit;

    drivenOutputId: Link;
    integralReset: number;

    boilPointAdjust: Unit;
    boilMinOutput: number;
    boilModeActive: boolean;
  };
}

export interface Setpoint {
  time: number;
  temperature: Unit;
}

export interface SetpointProfileBlock extends Block {
  type: 'SetpointProfile';
  data: {
    start: number;
    points: Setpoint[];
    enabled: boolean;
    targetId: Link;
    drivenTargetId: Link;
  };
}

export const FilterChoice = Enum(
  'FILTER_NONE',
  'FILTER_15s',
  'FILTER_45s',
  'FILTER_90s',
  'FILTER_3m',
  'FILTER_10m',
  'FILTER_30m',
);
export type FilterChoice = Enum<typeof FilterChoice>;

export interface SetpointSensorPairBlock extends Block {
  type: 'SetpointSensorPair';
  data: {
    sensorId: Link;

    value: Unit;
    valueUnfiltered: Unit;

    setting: Unit;
    storedSetting: Unit;
    settingEnabled: boolean;

    filter: FilterChoice;
    filterThreshold: Unit;
    resetFilter: boolean;
  };
}

export const Spark2Hardware = Enum(
  'HW_UNKNOWN',
  'HW_SPARK1',
  'HW_SPARK2',
);
export type Spark2Hardware = Enum<typeof Spark2Hardware>;

export interface Spark2PinsBlock extends Block {
  type: 'Spark2Pins';
  data: {
    pins: IoPin[];
    soundAlarm: boolean;
    hardware: Spark2Hardware;
  };
}

export interface Spark3PinsBlock extends Block {
  type: 'Spark3Pins';
  data: {
    pins: IoPin[];
    enableIoSupply5V: boolean;
    enableIoSupply12V: boolean;
    soundAlarm: boolean;
    voltage5: number;
    voltage12: number;
  };
}

export const SparkPlatform = Enum(
  'PLATFORM_UNKNOWN',
  'PLATFORM_GCC',
  'PLATFORM_PHOTON',
  'PLATFORM_P1',
);
export type SparkPlatform = Enum<typeof SparkPlatform>;

export interface SysInfoBlock extends Block {
  type: 'SysInfo';
  data: {
    deviceId: string;
    version: string;
    platform: SparkPlatform;
    protocolVersion: string;
    releaseDate: string;
    protocolDate: string;
    command: any; // write-only, for internal use
    trace: any[]; // for internal use
  };
}

export interface Fluctuation {
  amplitude: Unit; // DeltaTemp
  period: Unit; // Time
}

export interface TempSensorMockBlock extends Block {
  type: 'TempSensorMock';
  data: {
    value: Unit; // readonly Temp
    connected: boolean;
    setting: Unit; // Temp
    fluctuations: Fluctuation[];
  };
}

export interface TempSensorOneWireBlock extends Block {
  type: 'TempSensorOneWire';
  data: {
    value: Unit;
    offset: Unit;
    address: string;
  };
}

export interface TicksBlock extends Block {
  type: 'Ticks';
  data: {
    millisSinceBoot: number;
    secondsSinceEpoch: number;
    avgCommunicationTask: number;
    avgBlocksUpdateTask: number;
    avgDisplayTask: number;
    avgSystemTask: number;
  };
}

export const TouchCalibrated = Enum(
  'CALIBRATED_NO',
  'CALIBRATED_YES',
  'CALIBRATED_NEW',
);
export type TouchCalibrated = Enum<typeof TouchCalibrated>;

export interface TouchSettingsBlock extends Block {
  type: 'TouchSettings';
  data: {
    calibrated: TouchCalibrated;
    xOffset: number;
    yOffset: number;
    xBitsPerPixelX16: number;
    yBitsPerPixelX16: number;
  };
}

export const WifiSecurityType = Enum(
  'WLAN_SEC_UNSEC',
  'WLAN_SEC_WEP',
  'WLAN_SEC_WPA',
  'WLAN_SEC_WPA2',
  'WLAN_SEC_WPA_ENTERPRISE',
  'WLAN_SEC_WPA2_ENTERPRISE',
  'WLAN_SEC_NOT_SET',
);
export type WifiSecurityType = Enum<typeof WifiSecurityType>;

export const WifiCipherType = Enum(
  'WLAN_CIPHER_NOT_SET',
  'WLAN_CIPHER_AES',
  'WLAN_CIPHER_TKIP',
  'WLAN_CIPHER_AES_TKIP', // OR of AES and TKIP
);
export type WifiCipherType = Enum<typeof WifiCipherType>;

export interface WiFiSettingsBlock extends Block {
  type: 'WiFiSettings';
  data: {
    ssid: string; // write-only
    password: string; // write-only
    security: WifiSecurityType; // write-only
    cipher: WifiCipherType; // write-only
    signal: number;
    ip: string;
  };
}
