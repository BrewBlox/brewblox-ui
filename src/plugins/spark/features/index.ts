import { Plugin } from 'vue';
import ActuatorAnalogMock from './ActuatorAnalogMock';
import ActuatorLogic from './ActuatorLogic';
import ActuatorOffset from './ActuatorOffset';
import ActuatorPwm from './ActuatorPwm';
import AnalogGpioModule from './AnalogGpioModule';
import Balancer from './Balancer';
import DeprecatedObject from './DeprecatedObject';
import DigitalActuator from './DigitalActuator';
import DigitalInput from './DigitalInput';
import DisplaySettings from './DisplaySettings';
import DS2408 from './DS2408';
import DS2413 from './DS2413';
import FastPwm from './FastPwm';
import InactiveObject from './InactiveObject';
import MockPins from './MockPins';
import MotorValve from './MotorValve';
import Mutex from './Mutex';
import OneWireGpioModule from './OneWireGpioModule';
import Pid from './Pid';
import QuickActions from './QuickActions';
import QuickValues from './QuickValues';
import Sequence from './Sequence';
import SetpointProfile from './SetpointProfile';
import SetpointSensorPair from './SetpointSensorPair';
import Spark2Pins from './Spark2Pins';
import Spark3Pins from './Spark3Pins';
import SparkDisplay from './SparkDisplay';
import SysInfo from './SysInfo';
import TempSensorAnalog from './TempSensorAnalog';
import TempSensorCombi from './TempSensorCombi';
import TempSensorExternal from './TempSensorExternal';
import TempSensorMock from './TempSensorMock';
import TempSensorOneWire from './TempSensorOneWire';
import Variables from './Variables';

const plugins: Plugin[] = [
  ActuatorAnalogMock,
  ActuatorLogic,
  ActuatorOffset,
  ActuatorPwm,
  AnalogGpioModule,
  Balancer,
  DigitalActuator,
  DigitalInput,
  DisplaySettings,
  DS2408,
  DS2413,
  DeprecatedObject,
  FastPwm,
  InactiveObject,
  MockPins,
  Pid,
  MotorValve,
  Mutex,
  OneWireGpioModule,
  Sequence,
  SetpointProfile,
  SetpointSensorPair,
  Spark2Pins,
  Spark3Pins,
  SparkDisplay,
  SysInfo,
  QuickActions,
  QuickValues,
  TempSensorAnalog,
  TempSensorCombi,
  TempSensorExternal,
  TempSensorMock,
  TempSensorOneWire,
  Variables,
];

export default plugins;
