import { Link, Quantity } from '@/plugins/spark/bloxfield';

import type {
  AnalogCompareOp,
  BlockType,
  ChannelConfig,
  DigitalCompareOp,
  DigitalState,
  DisplayTempUnit,
  FilterChoice,
  LogicResult,
  ReferenceKind,
  Spark2Hardware,
  SparkPlatform,
  TouchCalibrated,
  ValveState,
  WifiCipherType,
  WifiSecurityType,
} from './block-enums';

export interface Block {
  serviceId: string;
  id: string;
  nid?: number;
  type: BlockType;
  groups: number[];
  data: any;
}

export type Readonly<T> = T;

export interface IoChannel {
  config: ChannelConfig;
  state: DigitalState;
}

export interface IoPin {
  [pinId: string]: IoChannel;
}

export interface MinConstraint {
  limiting: boolean;
  min: number;
}

export interface MaxConstraint {
  limiting: boolean;
  max: number;
}

export interface BalancedConstraint {
  limiting: boolean;
  balanced: {
    balancerId: Link;
    granted: number;
    id: number;
  };
}

export interface MinOnConstraint {
  remaining: Quantity;
  minOn: Quantity;
}

export interface MinOffConstraint {
  remaining: Quantity;
  minOff: Quantity;
}

export interface MutexedConstraint {
  remaining: Quantity;
  mutexed: {
    mutexId: Link;
    extraHoldTime: Quantity;
    hasCustomHoldTime: boolean;
    hasLock: boolean;
  };
}

export interface DelayedOnConstraint {
  remaining: Quantity;
  delayedOn: Quantity;
}

export interface DelayedOffConstraint {
  remaining: Quantity;
  delayedOff: Quantity;
}

export type AnalogConstraint =
  | MinConstraint
  | MaxConstraint
  | BalancedConstraint

export type DigitalConstraint =
  | MutexedConstraint
  | MinOnConstraint
  | MinOffConstraint
  | DelayedOnConstraint
  | DelayedOffConstraint

export interface AnalogConstraintsObj {
  constraints: AnalogConstraint[];
}

export interface DigitalConstraintsObj {
  constraints: DigitalConstraint[];
}

export interface AnyConstraintsObj {
  constraints: (AnalogConstraint | DigitalConstraint)[];
}

export interface ActuatorAnalogMockBlock extends Block {
  type: 'ActuatorAnalogMock';
  data: {
    desiredSetting: number;
    minSetting: number;
    maxSetting: number;
    value: number;
    minValue: number;
    maxValue: number;
    constrainedBy: AnalogConstraintsObj;

    setting: Readonly<number>;
  };
}

export interface DigitalCompare {
  id: Link<'ActuatorDigitalInterface'>;
  op: DigitalCompareOp;
  rhs: DigitalState;
  result: Readonly<LogicResult>;
}

export interface AnalogCompare {
  id: Link<'ProcessValueInterface'>;
  op: AnalogCompareOp;
  rhs: number;
  result: Readonly<LogicResult>;
}

export interface ActuatorLogicBlock extends Block {
  type: 'ActuatorLogic';
  data: {
    enabled: boolean;
    targetId: Link<'ActuatorDigitalInterface'>;
    digital: DigitalCompare[];
    analog: AnalogCompare[];
    expression: string; // a-zA-Z&|^!()

    result: Readonly<LogicResult>;
    errorPos: Readonly<number>;
    drivenTargetId: Readonly<Link<'ActuatorDigitalInterface'>>;
  };
}

export interface ActuatorOffsetBlock extends Block {
  type: 'ActuatorOffset';
  data: {
    enabled: boolean;
    desiredSetting: number;
    targetId: Link<'ProcessValueInterface'>;
    referenceId: Link<'ProcessValueInterface'>;
    referenceSettingOrValue: ReferenceKind;
    constrainedBy: AnalogConstraintsObj;

    setting: Readonly<number>;
    value: Readonly<number>;
    drivenTargetId: Readonly<Link<'ProcessValueInterface'>>;
  };
}

export interface ActuatorPwmBlock extends Block {
  type: 'ActuatorPwm';
  data: {
    enabled: boolean;
    desiredSetting: number;
    period: Quantity<'Second'>;
    actuatorId: Link<'ActuatorDigitalInterface'>;
    constrainedBy: AnalogConstraintsObj;

    setting: Readonly<number>;
    value: Readonly<number>;
    drivenActuatorId: Readonly<Link<'ActuatorDigitalInterface'>>;
  };
}

export interface BalancedActuator {
  id: Readonly<number>;
  requested: Readonly<number>;
  granted: Readonly<number>;
}

export interface BalancerBlock extends Block {
  type: 'Balancer';
  data: {
    clients: Readonly<BalancedActuator[]>;
  };
}

export interface DeprecatedObjectBlock extends Block {
  type: 'DeprecatedObject';
  data: {
    actualId: Readonly<number>;
  };
}

export interface DigitalActuatorBlock extends Block {
  type: 'DigitalActuator';
  data: {
    hwDevice: Link<'IoArrayInterface'>;
    channel: number;
    desiredState: DigitalState;
    invert: boolean;
    constrainedBy: DigitalConstraintsObj;

    state: Readonly<DigitalState>;
  };
}

export interface DisplaySlot {
  pos: number;
  color: string;
  name: string;

  // Value will be one of these
  tempSensor?: Link<'TempSensorInterface'>;
  setpointSensorPair?: Link<'SetpointSensorPairInterface'>;
  actuatorAnalog?: Link<'ActuatorAnalogInterface'>;
  pid?: Link<'Pid'>;
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

export interface DS2408Block extends Block {
  type: 'DS2408';
  data: {
    address: string;
    pins: Readonly<IoPin[]>;
    connected: Readonly<boolean>;
  };
}

export interface DS2413Block extends Block {
  type: 'DS2413';
  data: {
    address: string;
    pins: Readonly<IoPin[]>;
    connected: Readonly<boolean>;
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
    pins: Readonly<IoPin[]>;
  };
}

export interface MotorValveBlock extends Block {
  type: 'MotorValve';
  data: {
    hwDevice: Link<'DS2408Interface'>;
    startChannel: number;
    desiredState: DigitalState;
    constrainedBy: DigitalConstraintsObj;

    state: Readonly<DigitalState>;
    valveState: Readonly<ValveState>;
  };
}

export interface MutexBlock extends Block {
  type: 'Mutex';
  data: {
    differentActuatorWait: Quantity<'Second'>;
    waitRemaining: Readonly<Quantity<'Second'>>;
  };
}

export interface OneWireBusCommand {
  opcode: number;
  data: number;
}

export interface OneWireBusBlock extends Block {
  type: 'OneWireBus';
  data: {
    command: OneWireBusCommand;
    address: Readonly<string[]>;
  };
}

export interface PidBlock extends Block {
  type: 'Pid';
  data: {
    inputId: Link<'SetpointSensorPairInterface'>;
    outputId: Link<'ActuatorAnalogInterface'>;

    inputValue: Readonly<Quantity<'Temp'>>;
    inputSetting: Readonly<Quantity<'Temp'>>;
    outputValue: Readonly<number>;
    outputSetting: Readonly<number>;

    enabled: boolean;
    active: Readonly<boolean>;

    kp: Quantity<'InverseTemp'>;
    ti: Quantity<'Second'>;
    td: Quantity<'Second'>;

    p: Readonly<number>;
    i: Readonly<number>;
    d: Readonly<number>;

    error: Readonly<Quantity<'DeltaTemp'>>;
    integral: Readonly<Quantity<'DeltaTempMultHour'>>;
    derivative: Readonly<Quantity<'DeltaTempPerMinute'>>;
    derivativeFilter: Readonly<FilterChoice>;

    drivenOutputId: Readonly<Link<'ActuatorAnalogInterface'>>;
    integralReset: number;

    boilPointAdjust: Quantity<'DeltaTemp'>;
    boilMinOutput: number;
    boilModeActive: Readonly<boolean>;
  };
}

export interface Setpoint {
  time: number;
  temperature: Quantity<'Temp'>;
}

export interface SetpointProfileBlock extends Block {
  type: 'SetpointProfile';
  data: {
    start: number;
    points: Setpoint[];
    enabled: boolean;
    targetId: Link<'SetpointSensorPair'>;
    drivenTargetId: Readonly<Link<'SetpointSensorPair'>>;
  };
}

export interface SetpointSensorPairBlock extends Block {
  type: 'SetpointSensorPair';
  data: {
    sensorId: Link<'TempSensorInterface'>;

    storedSetting: Quantity<'Temp'>;
    settingEnabled: boolean;

    filter: FilterChoice;
    filterThreshold: Quantity<'DeltaTemp'>;
    resetFilter: boolean;

    setting: Readonly<Quantity<'Temp'>>;
    value: Readonly<Quantity<'Temp'>>;
    valueUnfiltered: Readonly<Quantity<'Temp'>>;
  };
}

export interface Spark2PinsBlock extends Block {
  type: 'Spark2Pins';
  data: {
    soundAlarm: boolean;
    pins: Readonly<IoPin[]>;
    hardware: Readonly<Spark2Hardware>;
  };
}

export interface Spark3PinsBlock extends Block {
  type: 'Spark3Pins';
  data: {
    enableIoSupply5V: boolean;
    enableIoSupply12V: boolean;
    soundAlarm: boolean;
    pins: Readonly<IoPin[]>;
    voltage5: Readonly<number>;
    voltage12: Readonly<number>;
  };
}

export interface SysInfoBlock extends Block {
  type: 'SysInfo';
  data: {
    deviceId: Readonly<string>;
    version: Readonly<string>;
    platform: Readonly<SparkPlatform>;
    protocolVersion: Readonly<string>;
    releaseDate: Readonly<string>;
    protocolDate: Readonly<string>;

    // internal use only
    command: any;
    trace: Readonly<any[]>;
  };
}

export interface Fluctuation {
  amplitude: Quantity<'DeltaTemp'>;
  period: Quantity<'Second'>;
}

export interface TempSensorMockBlock extends Block {
  type: 'TempSensorMock';
  data: {
    connected: boolean;
    setting: Quantity<'Temp'>;
    fluctuations: Fluctuation[];
    value: Readonly<Quantity<'Temp'>>;
  };
}

export interface TempSensorOneWireBlock extends Block {
  type: 'TempSensorOneWire';
  data: {
    offset: Quantity<'DeltaTemp'>;
    address: string;
    value: Readonly<Quantity<'Temp'>>;
  };
}

export interface TicksBlock extends Block {
  type: 'Ticks';
  data: {
    secondsSinceEpoch: number;
    millisSinceBoot: Readonly<number>;
    avgCommunicationTask: Readonly<number>;
    avgBlocksUpdateTask: Readonly<number>;
    avgDisplayTask: Readonly<number>;
    avgSystemTask: Readonly<number>;
  };
}

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

export interface WiFiSettingsBlock extends Block {
  type: 'WiFiSettings';
  data: {
    signal: Readonly<number>;
    ip: Readonly<string>;

    // write-only types
    ssid: string;
    password: string;
    security: WifiSecurityType;
    cipher: WifiCipherType;
  };
}
