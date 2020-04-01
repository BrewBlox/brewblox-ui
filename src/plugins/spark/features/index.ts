import { SparkFeature } from '@/plugins/spark/types';

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
import MotorValve from './MotorValve';
import Mutex from './Mutex';
import Pid from './Pid';
import QuickActions from './QuickActions';
import SetpointProfile from './SetpointProfile';
import SetpointSensorPair from './SetpointSensorPair';
import Spark2Pins from './Spark2Pins';
import Spark3Pins from './Spark3Pins';
import TempSensorMock from './TempSensorMock';
import TempSensorOneWire from './TempSensorOneWire';

const features: { [id: string]: SparkFeature } = {
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
  Pid,
  MotorValve,
  Mutex,
  SetpointProfile,
  SetpointSensorPair,
  Spark2Pins,
  Spark3Pins,
  QuickActions,
  TempSensorMock,
  TempSensorOneWire,
};

export default features;
