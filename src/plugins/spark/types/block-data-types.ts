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

export type DigitalCompareOp =
  | 'VALUE_IS'
  | 'VALUE_ISNOT'
  | 'DESIRED_IS'
  | 'DESIRED_ISNOT'

export type AnalogCompareOp =
  | 'VALUE_LE'
  | 'VALUE_GE'
  | 'SETTING_LE'
  | 'SETTING_GE'

export type CombineOp =
  | 'OR'
  | 'AND'
  | 'OR_NOT'
  | 'AND_NOT'
  | 'XOR'

export type EvalResult =
  | 'FALSE'
  | 'TRUE'
  | 'EMPTY'
  | 'EMPTY_SUBSTRING'
  | 'BLOCK_NOT_FOUND'
  | 'INVALID_DIGITAL_OP'
  | 'INVALID_ANALOG_OP'
  | 'INVALID_ANA_COMPARE_IDX'
  | 'INVALID_DIG_COMPARE_IDX'
  | 'UNEXPECTED_CLOSING_BRACKET'
  | 'MISSING_CLOSING_BRACKET'
  | 'UNEXPECTED_OPENING_BRACKET'
  | 'UNEXPECTED_CHARACTER'
  | 'UNEXPECTED_COMPARISON'
  | 'UNEXPECTED_OPERATOR'

export interface DigitalCompare {
  op: DigitalCompareOp;
  result: EvalResult;
  id: Link;
  rhs: DigitalState;
}

export interface AnalogCompare {
  op: AnalogCompareOp;
  result: EvalResult;
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
    result: EvalResult; // readonly
    errorPos: number; // readonly
    targetId: Link;
    drivenTargetId: Link; // readonly
    digital: DigitalCompare[];
    analog: AnalogCompare[];
    expression: string; // a-zA-Z&|^!()
  };
}

export type OffsetSettingOrValue =
  | 'Setting'
  | 'Value'

export interface ActuatorOffsetBlock extends Block {
  type: 'ActuatorOffset';
  data: {
    enabled: boolean;
    desiredSetting: number;
    referenceSettingOrValue: OffsetSettingOrValue;

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

export type DisplaySettingsTempUnit =
  | 'Celsius'
  | 'Fahrenheit'
  ;

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
    tempUnit: DisplaySettingsTempUnit;
    widgets: DisplaySlot[];
    brightness: number;
  };
}

export enum DS2408Id {
  A = 1,
  B = 2,
  C = 3,
  D = 4,
  E = 5,
  F = 6,
  G = 7,
  H = 8,
}

export enum ValveStartId {
  B = 1,
  A = 5,
}

export interface DS2408Block extends Block {
  type: 'DS2408';
  data: {
    address: string;
    connected: boolean;
    pins: IoPin[];
  };
}

export enum DS2413Id {
  A = 1,
  B = 2,
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

export interface MockPinsBlock extends Block {
  type: 'MockPins';
  data: {
    pins: IoPin[];
  };
}

export type ValveState =
  | 'Unknown'
  | 'Open'
  | 'Closed'
  | 'Opening'
  | 'Closing'
  | 'HalfOpenIdle'
  | 'InitIdle'

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


export type FilterChoice =
  | 'FILT_NONE'
  | 'FILT_15s'
  | 'FILT_45s'
  | 'FILT_90s'
  | 'FILT_3m'
  | 'FILT_10m'
  | 'FILT_30m'


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

export type Spark2Hardware =
  | 'unknown_hw'
  | 'Spark1'
  | 'Spark2'

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
