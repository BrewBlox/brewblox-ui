import { SparkFeature } from '@/plugins/spark/types';

import ActuatorAnalogMock from './ActuatorAnalogMock';
import ActuatorDS2413 from './ActuatorDS2413';
import ActuatorOffset from './ActuatorOffset';
import ActuatorPin from './ActuatorPin';
import ActuatorPwm from './ActuatorPwm';
import Balancer from './Balancer';
import DS2413 from './DS2413';
import DisplaySettings from './DisplaySettings';
import InactiveObject from './InactiveObject';
import Mutex from './Mutex';
import Pid from './Pid';
import ProcessView from './ProcessView';
import SessionView from './SessionView';
import SetpointProfile from './SetpointProfile';
import SetpointSensorPair from './SetpointSensorPair';
import StepView from './StepView';
import TempSensorMock from './TempSensorMock';
import TempSensorOneWire from './TempSensorOneWire';

const features: { [id: string]: SparkFeature } = {
  ActuatorAnalogMock,
  ActuatorDS2413,
  ActuatorOffset,
  ActuatorPin,
  ActuatorPwm,
  Balancer,
  DisplaySettings,
  DS2413,
  InactiveObject,
  Pid,
  Mutex,
  SetpointProfile,
  SetpointSensorPair,
  StepView,
  ProcessView,
  TempSensorMock,
  TempSensorOneWire,
  SessionView,
};

export default features;
