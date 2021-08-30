import { Plugin } from 'vue';

import ActuatorAnalogMock from './ActuatorAnalogMock';
import ActuatorLogic from './ActuatorLogic';
import ActuatorOffset from './ActuatorOffset';
import ActuatorPwm from './ActuatorPwm';
import Balancer from './Balancer';
import DeprecatedObject from './DeprecatedObject';
import DigitalActuator from './DigitalActuator';
import DisplaySettings from './DisplaySettings';
import DS2408 from './DS2408';
import DS2413 from './DS2413';
import InactiveObject from './InactiveObject';
import MockPins from './MockPins';
import MotorValve from './MotorValve';
import Mutex from './Mutex';
import OneWireGpioModule from './OneWireGpioModule';
import OneWireGpioTest from './OneWireGpioTest';
import Pid from './Pid';
import QuickActions from './QuickActions';
import QuickValues from './QuickValues';
import SetpointProfile from './SetpointProfile';
import SetpointSensorPair from './SetpointSensorPair';
import Spark2Pins from './Spark2Pins';
import Spark3Pins from './Spark3Pins';
import SparkDisplay from './SparkDisplay';
import SysInfo from './SysInfo';
import TempSensorCombi from './TempSensorCombi';
import TempSensorMock from './TempSensorMock';
import TempSensorOneWire from './TempSensorOneWire';

const plugins: Plugin[] = [
  ActuatorAnalogMock,
  ActuatorLogic,
  ActuatorOffset,
  ActuatorPwm,
  Balancer,
  DigitalActuator,
  DisplaySettings,
  DS2408,
  DS2413,
  DeprecatedObject,
  InactiveObject,
  MockPins,
  Pid,
  MotorValve,
  Mutex,
  OneWireGpioModule,
  OneWireGpioTest,
  SetpointProfile,
  SetpointSensorPair,
  Spark2Pins,
  Spark3Pins,
  SparkDisplay,
  SysInfo,
  QuickActions,
  QuickValues,
  TempSensorCombi,
  TempSensorMock,
  TempSensorOneWire,
];

export default plugins;
