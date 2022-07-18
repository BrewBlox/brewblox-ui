import type {
  AnalogCompareOp,
  BlockOrIntfType,
  BlockType,
  DS2408ConnectMode,
  DigitalCompareOp,
  DigitalState,
  DisplayTempUnit,
  FilterChoice,
  GpioDeviceType,
  GpioModuleStatus,
  GpioPins,
  LogicResult,
  ReferenceKind,
  SensorCombiFunc,
  SequenceError,
  SequenceStatus,
  Spark2Hardware,
  SparkPlatform,
  TouchCalibrated,
  ValveState,
  WifiCipherType,
  WifiSecurityType,
} from './spark-block-enums';

// #region Block
export interface Block {
  id: string;
  nid?: number;
  serviceId: string;
  type: BlockType;
  data: any;
  meta?: { [k: string]: any };
}
// #endregion Block

// #region BloxField
export interface BloxField {
  __bloxtype: string;
}

export interface Quantity extends BloxField {
  __bloxtype: 'Quantity';
  value: number | null;
  unit: string;
  readonly?: boolean;
}

export interface Link extends BloxField {
  __bloxtype: 'Link';
  id: string | null;
  type: BlockOrIntfType | null;
  driven?: boolean;
}
// #endregion BloxField

export interface DefinedQuantity extends Quantity {
  value: number;
}

export interface DefinedLink extends Link {
  id: string;
  type: BlockOrIntfType;
}

// #region IoChannel
export interface IoChannel {
  id: number;
}

export interface IoArrayBlock extends Block {
  data: {
    channels: IoChannel[];
  };
}
// #endregion IoChannel

// #region Constraints
export interface MinConstraint {
  limiting: Readonly<boolean>;
  min: number;
}

export interface MaxConstraint {
  limiting: Readonly<boolean>;
  max: number;
}

export interface BalancedConstraint {
  limiting: Readonly<boolean>;
  balanced: {
    balancerId: Link;
    granted: number;
    id: number;
  };
}

export interface MinOnConstraint {
  remaining: Readonly<Quantity>;
  minOn: Quantity;
}

export interface MinOffConstraint {
  remaining: Readonly<Quantity>;
  minOff: Quantity;
}

export interface MutexedConstraint {
  remaining: Readonly<Quantity>;
  mutexed: {
    mutexId: Link;
    extraHoldTime: Quantity;
    hasCustomHoldTime: boolean;
    hasLock: boolean;
  };
}

export interface DelayedOnConstraint {
  remaining: Readonly<Quantity>;
  delayedOn: Quantity;
}

export interface DelayedOffConstraint {
  remaining: Readonly<Quantity>;
  delayedOff: Quantity;
}

export type AnalogConstraint =
  | MinConstraint
  | MaxConstraint
  | BalancedConstraint;

export type DigitalConstraint =
  | MutexedConstraint
  | MinOnConstraint
  | MinOffConstraint
  | DelayedOnConstraint
  | DelayedOffConstraint;

export interface AnalogConstraintsObj {
  constraints: AnalogConstraint[];
}

export interface DigitalConstraintsObj {
  constraints: DigitalConstraint[];
}
// #endregion Constraints

// #region AnyConstraint
export type AnyConstraint = AnalogConstraint | DigitalConstraint;

export interface AnyConstraintsObj {
  constraints: AnyConstraint[];
}
// #endregion AnyConstraint

// #region ActuatorAnalogMock
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
// #endregion ActuatorAnalogMock

// #region ActuatorLogic
export interface DigitalCompare {
  id: Link;
  op: DigitalCompareOp;
  rhs: DigitalState;
  result: Readonly<LogicResult>;
}

export interface AnalogCompare {
  id: Link;
  op: AnalogCompareOp;
  rhs: number;
  result: Readonly<LogicResult>;
}

export interface ActuatorLogicBlock extends Block {
  type: 'ActuatorLogic';
  data: {
    enabled: boolean;
    digital: DigitalCompare[]; // a-z
    analog: AnalogCompare[]; // A-Z
    expression: string; // a-zA-Z&|^!()

    result: Readonly<LogicResult>;
    errorPos: Readonly<number>;

    targetId: Link;
    drivenTargetId: Readonly<Link>;
  };
}
// #endregion ActuatorLogic

// #region ActuatorOffset
export interface ActuatorOffsetBlock extends Block {
  type: 'ActuatorOffset';
  data: {
    enabled: boolean;
    referenceId: Link;
    referenceSettingOrValue: ReferenceKind;
    targetId: Link;
    drivenTargetId: Readonly<Link>;
    constrainedBy: AnalogConstraintsObj;

    desiredSetting: number;
    setting: Readonly<number>;
    value: Readonly<number>;
  };
}
// #endregion ActuatorOffset

// #region ActuatorPwm
export interface ActuatorPwmBlock extends Block {
  type: 'ActuatorPwm';
  data: {
    enabled: boolean;
    period: Quantity;
    actuatorId: Link;
    drivenActuatorId: Readonly<Link>;
    constrainedBy: AnalogConstraintsObj;

    desiredSetting: number;
    setting: Readonly<number>;
    value: Readonly<number>;
  };
}
// #endregion ActuatorPwm

// #region Balancer
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
// #endregion Balancer

// #region DeprecatedObject
export interface DeprecatedObjectBlock extends Block {
  type: 'DeprecatedObject';
  data: {
    actualId: Readonly<number>;
  };
}
// #endregion DeprecatedObject

// #region DigitalActuator
export interface DigitalActuatorBlock extends Block {
  type: 'DigitalActuator';
  data: {
    hwDevice: Link;
    channel: number;
    invert: boolean;

    desiredState: DigitalState;
    state: Readonly<DigitalState | null>;

    constrainedBy: DigitalConstraintsObj;
  };
}
// #endregion DigitalActuator

// #region DisplaySettings
export interface DisplaySlot {
  pos: number; // 1-indexed
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
    timeZone: string;
  };
}
// #endregion DisplaySettings

// #region DS2408
export interface DS2408Block extends Block {
  type: 'DS2408';
  data: {
    address: string;
    channels: Readonly<IoChannel[]>;
    connectMode: DS2408ConnectMode;
    connected: Readonly<boolean>;
    oneWireBusId: Readonly<number>;
  };
}
// #endregion DS2408

// #region DS2413
export interface DS2413Block extends Block {
  type: 'DS2413';
  data: {
    address: string;
    channels: Readonly<IoChannel[]>;
    connected: Readonly<boolean>;
    oneWireBusId: Readonly<number>;
  };
}
// #endregion DS2413

// #region InactiveObject
export interface InactiveObjectBlock extends Block {
  type: 'InactiveObject';
  data: {
    actualType: BlockType;
  };
}
// #endregion InactiveObject

// #region MockPins
export interface MockPinsBlock extends Block {
  type: 'MockPins';
  data: {
    channels: Readonly<IoChannel[]>;
  };
}
// #endregion MockPins

// #region MotorValve
export interface MotorValveBlock extends Block {
  type: 'MotorValve';
  data: {
    hwDevice: Link;
    startChannel: number;

    desiredState: DigitalState;
    state: Readonly<DigitalState | null>;
    valveState: Readonly<ValveState | null>;

    constrainedBy: DigitalConstraintsObj;
  };
}
// #endregion MotorValve

// #region Mutex
export interface MutexBlock extends Block {
  type: 'Mutex';
  data: {
    differentActuatorWait: Quantity;
    waitRemaining: Readonly<Quantity>;
  };
}
// #endregion Mutex

// #region OneWireBus
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
// #endregion OneWireBus

// #region OneWireGpioModule
export interface GpioModuleChannel extends IoChannel {
  id: number;
  name: string;
  deviceType: GpioDeviceType;
  pinsMask: GpioPins;
  width: number;
}

export interface OneWireGpioModuleBlock extends Block {
  type: 'OneWireGpioModule';
  data: {
    channels: GpioModuleChannel[];
    modulePosition: number;
    moduleStatus: GpioModuleStatus;
    moduleStatusClear: GpioPins; // write-only
    useExternalPower: boolean;

    pullUpDesired: Readonly<GpioPins>;
    pullUpStatus: Readonly<GpioPins>;
    pullUpWhenActive: Readonly<GpioPins>;
    pullUpWhenInactive: Readonly<GpioPins>;
    pullDownDesired: Readonly<GpioPins>;
    pullDownStatus: Readonly<GpioPins>;
    pullDownWhenActive: Readonly<GpioPins>;
    pullDownWhenInactive: Readonly<GpioPins>;
    overCurrent: Readonly<GpioPins>;
    openLoad: Readonly<GpioPins>;
  };
}
// #endregion OneWireGpioModule

// #region Pid
export interface PidBlock extends Block {
  type: 'Pid';
  data: {
    inputId: Link;
    outputId: Link;

    inputValue: Readonly<Quantity>;
    inputSetting: Readonly<Quantity>;
    outputValue: Readonly<number>;
    outputSetting: Readonly<number>;

    enabled: boolean;
    active: Readonly<boolean>;

    kp: Quantity;
    ti: Quantity;
    td: Quantity;

    p: Readonly<number>;
    i: Readonly<number>;
    d: Readonly<number>;

    error: Readonly<Quantity>;
    integral: Readonly<Quantity>;
    derivative: Readonly<Quantity>;
    derivativeFilter: Readonly<FilterChoice>;

    drivenOutputId: Readonly<Link>;
    integralReset: number;

    boilPointAdjust: Quantity;
    boilMinOutput: number;
    boilModeActive: Readonly<boolean>;
  };
}
// #endregion Pid

// #region Sequence
export interface SequenceBlock extends Block {
  type: 'Sequence';
  data: {
    enabled: boolean;
    overrideState: boolean;
    activeInstruction: number;
    activeInstructionStartedAt: number; // seconds since 1970/1/1
    disabledAt: number; // seconds since 1970/1/1
    disabledDuration: number; // seconds
    status: SequenceStatus;
    error: SequenceError;
    instructions: string[];
  };
}
// #endregion Sequence

// #region SetpointProfile
export interface Setpoint {
  time: number; // seconds since start
  temperature: Quantity;
}

export interface SetpointProfileBlock extends Block {
  type: 'SetpointProfile';
  data: {
    start: number; // seconds since 1970/1/1
    points: Setpoint[];
    enabled: boolean;
    targetId: Link;
    drivenTargetId: Readonly<Link>;
  };
}
// #endregion SetpointProfile

// #region SetpointSensorPair
export interface SetpointSensorPairBlock extends Block {
  type: 'SetpointSensorPair';
  data: {
    storedSetting: Quantity;
    settingEnabled: boolean;
    filter: FilterChoice;
    filterThreshold: Quantity;
    resetFilter: boolean;
    setting: Readonly<Quantity>;

    sensorId: Link;
    value: Readonly<Quantity>;
    valueUnfiltered: Readonly<Quantity>;
  };
}
// #endregion SetpointSensorPair

// #region Spark2Pins
export interface Spark2PinsBlock extends Block {
  type: 'Spark2Pins';
  data: {
    soundAlarm: boolean;
    channels: Readonly<IoChannel[]>;
    hardware: Readonly<Spark2Hardware>;
  };
}
// #endregion Spark2Pins

// #region Spark3Pins
export interface Spark3PinsBlock extends Block {
  type: 'Spark3Pins';
  data: {
    enableIoSupply5V: boolean;
    enableIoSupply12V: boolean;
    soundAlarm: boolean;
    channels: Readonly<IoChannel[]>;
    voltage5: Readonly<number>;
    voltage12: Readonly<number>;
  };
}
// #endregion Spark3Pins

// #region SysInfo
export interface SysInfoBlock extends Block {
  type: 'SysInfo';
  data: {
    deviceId: Readonly<string>;
    version: Readonly<string>;
    platform: Readonly<SparkPlatform>;
    protocolVersion: Readonly<string>;
    releaseDate: Readonly<string>;
    protocolDate: Readonly<string>;
    ip: Readonly<string>;

    // internal use only
    command: any;
    trace: Readonly<any[]>;
  };
}
// #endregion SysInfo

// #region TempSensorCombi
export interface TempSensorCombiBlock extends Block {
  type: 'TempSensorCombi';
  data: {
    value: Readonly<Quantity>;
    combineFunc: SensorCombiFunc;
    sensors: Link[];
  };
}
// #endregion TempSensorCombi

// #region TempSensorMock
export interface Fluctuation {
  amplitude: Quantity;
  period: Quantity;
}

export interface TempSensorMockBlock extends Block {
  type: 'TempSensorMock';
  data: {
    connected: boolean;
    setting: Quantity;
    fluctuations: Fluctuation[];
    value: Readonly<Quantity>;
  };
}
// #endregion TempSensorMock

// #region TempSensorOneWire
export interface TempSensorOneWireBlock extends Block {
  type: 'TempSensorOneWire';
  data: {
    offset: Quantity;
    address: string;
    value: Readonly<Quantity>;
    oneWireBusId: Readonly<Link>;
  };
}
// #endregion TempSensorOneWire

// #region TempSensorExternal
export interface TempSensorExternalBlock extends Block {
  type: 'TempSensorExternal';
  data: {
    enabled: boolean;
    timeout: Quantity;
    setting: Quantity;
    lastUpdated: Readonly<number>; // seconds since 1970/1/1
    value: Readonly<Quantity>;
  };
}
// #endregion TempSensorExternal

// #region Ticks
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
// #endregion Ticks

// #region TouchSettings
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
// #endregion TouchSettings

// #region WiFiSettings
export interface WiFiSettingsBlock extends Block {
  type: 'WiFiSettings';
  data: {
    signal: Readonly<number>; // dBm

    // Write-only values
    ssid: string;
    password: string;
    security: WifiSecurityType;
    cipher: WifiCipherType;
  };
}
// #endregion WiFiSettings
