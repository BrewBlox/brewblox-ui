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
  'VALUE_IS' = 'VALUE_IS',
  'VALUE_ISNOT' = 'VALUE_ISNOT',
  'DESIRED_IS' = 'DESIRED_IS',
  'DESIRED_ISNOT' = 'DESIRED_ISNOT',
}

export enum AnalogCompareOp {
  'VALUE_LE' = 'VALUE_LE',
  'VALUE_GE' = 'VALUE_GE',
  'SETTING_LE' = 'SETTING_LE',
  'SETTING_GE' = 'SETTING_GE',
}

export enum EvalResult {
  'FALSE' = 'FALSE',
  'TRUE' = 'TRUE',
  'EMPTY' = 'EMPTY',
  'EMPTY_SUBSTRING' = 'EMPTY_SUBSTRING',
  'BLOCK_NOT_FOUND' = 'BLOCK_NOT_FOUND',
  'INVALID_DIGITAL_OP' = 'INVALID_DIGITAL_OP',
  'INVALID_ANALOG_OP' = 'INVALID_ANALOG_OP',
  'INVALID_ANA_COMPARE_IDX' = 'INVALID_ANA_COMPARE_IDX',
  'INVALID_DIG_COMPARE_IDX' = 'INVALID_DIG_COMPARE_IDX',
  'UNEXPECTED_CLOSING_BRACKET' = 'UNEXPECTED_CLOSING_BRACKET',
  'MISSING_CLOSING_BRACKET' = 'MISSING_CLOSING_BRACKET',
  'UNEXPECTED_OPENING_BRACKET' = 'UNEXPECTED_OPENING_BRACKET',
  'UNEXPECTED_CHARACTER' = 'UNEXPECTED_CHARACTER',
  'UNEXPECTED_COMPARISON' = 'UNEXPECTED_COMPARISON',
  'UNEXPECTED_OPERATOR' = 'UNEXPECTED_OPERATOR',
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
  'SETTING' = 'SETTING',
  'VALUE' = 'VALUE',
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
  'CELSIUS' = 'CELSIUS',
  'FAHRENHEIT' = 'FAHRENHEIT',
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

export interface MockPinsBlock extends Block {
  type: 'MockPins';
  data: {
    pins: IoPin[];
  };
}

export enum ValveState {
  'Unknown' = 'Unknown',
  'Open' = 'Open',
  'Closed' = 'Closed',
  'Opening' = 'Opening',
  'Closing' = 'Closing',
  'HalfOpenIdle' = 'HalfOpenIdle',
  'InitIdle' = 'InitIdle',
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
  'FILT_NONE' = 'FILT_NONE',
  'FILT_15s' = 'FILT_15s',
  'FILT_45s' = 'FILT_45s',
  'FILT_90s' = 'FILT_90s',
  'FILT_3m' = 'FILT_3m',
  'FILT_10m' = 'FILT_10m',
  'FILT_30m' = 'FILT_30m',
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
  'unknown_hw' = 'unknown_hw',
  'Spark1' = 'Spark1',
  'Spark2' = 'Spark2',
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
