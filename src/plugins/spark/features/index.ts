import { SparkFeature } from '@/plugins/spark/types';

import ActuatorAnalogMock from './ActuatorAnalogMock';
import ActuatorOffset from './ActuatorOffset';
import ActuatorPwm from './ActuatorPwm';
import Balancer from './Balancer';
import DS2408 from './DS2408';
import DS2413 from './DS2413';
import DigitalActuator from './DigitalActuator';
import DisplaySettings from './DisplaySettings';
import InactiveObject from './InactiveObject';
import Mutex from './Mutex';
import Pid from './Pid';
import ProcessView from './ProcessView';
import SessionView from './SessionView';
import SetpointProfile from './SetpointProfile';
import SetpointSensorPair from './SetpointSensorPair';
import Spark2Pins from './Spark2Pins';
import Spark3Pins from './Spark3Pins';
import StepView from './StepView';
import TempSensorMock from './TempSensorMock';
import TempSensorOneWire from './TempSensorOneWire';

const features: { [id: string]: SparkFeature } = {
  ActuatorAnalogMock,
  ActuatorOffset,
  ActuatorPwm,
  Balancer,
  DigitalActuator,
  DisplaySettings,
  DS2408,
  DS2413,
  InactiveObject,
  Pid,
  Mutex,
  SetpointProfile,
  SetpointSensorPair,
  Spark2Pins,
  Spark3Pins,
  StepView,
  ProcessView,
  TempSensorMock,
  TempSensorOneWire,
  SessionView,
};

export default features;
