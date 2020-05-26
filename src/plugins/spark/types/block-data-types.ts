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

export enum DigitalCompareOp {
  VALUE_IS = 0,
  VALUE_ISNOT = 1,
  DESIRED_IS = 10,
  DESIRED_ISNOT = 11,
}

export enum AnalogCompareOp {
  VALUE_LE = 0,
  VALUE_GE = 1,
  SETTING_LE = 10,
  SETTING_GE = 11,
}

export enum CombineOp {
  OR = 0,
  AND = 1,
  OR_NOT = 2,
  AND_NOT = 3,
  XOR = 4,
}

export enum EvalResult {
  FALSE = 0,
  TRUE = 1,
  EMPTY = 2,
  EMPTY_SUBSTRING = 3,
  BLOCK_NOT_FOUND = 4,
  INVALID_DIGITAL_OP = 5,
  INVALID_ANALOG_OP = 6,
  INVALID_ANA_COMPARE_IDX = 7,
  INVALID_DIG_COMPARE_IDX = 8,
  UNEXPECTED_CLOSING_BRACKET = 9,
  MISSING_CLOSING_BRACKET = 10,
  UNEXPECTED_OPENING_BRACKET = 11,
  UNEXPECTED_CHARACTER = 12,
  UNEXPECTED_COMPARISON = 13,
  UNEXPECTED_OPERATOR = 14,
}

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

export enum OffsetSettingOrValue {
  Setting = 0,
  Value = 1,
}

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

export enum DisplaySettingsTempUnit {
  Celsius = 0,
  Fahrenheit = 1,
}

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

export enum ValveState {
  Unknown = 0,
  Open = 1,
  Closed = 2,
  Opening = 3,
  Closing = 4,
  HalfOpenIdle = 5,
  InitIdle = 6,
}

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

export enum FilterChoice {
  FilterNoFiltering = 0,
  Filter15s = 1,
  Filter45s = 2,
  Filter90s = 3,
  Filter3m = 4,
  Filter10m = 5,
  Filter30m = 6,
}

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

export enum Spark2Hardware {
  Unknown = 0,
  Spark1 = 1,
  SPark2 = 2,
}

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
