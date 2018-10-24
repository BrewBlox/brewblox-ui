import { Feature } from '@/store/features/state';

import ActuatorAnalogMock from './ActuatorAnalogMock';
import ActuatorOffset from './ActuatorOffset';
import ActuatorPin from './ActuatorPin';
import ActuatorPwm from './ActuatorPwm';
import Balancer from './Balancer';
import InactiveObject from './InactiveObject';
import TempSensorOneWire from './TempSensorOneWire';
import Pid from './Pid';
import Mutex from './Mutex';
import SetpointProfile from './SetpointProfile';
import SetpointSensorPair from './SetpointSensorPair';
import SetpointSimple from './SetpointSimple';
import ProcessView from './ProcessView';
import TempSensorMock from './TempSensorMock';

const features: { [id: string]: Feature } = {
  ActuatorAnalogMock,
  ActuatorOffset,
  ActuatorPin,
  ActuatorPwm,
  Balancer,
  InactiveObject,
  TempSensorOneWire,
  Pid,
  Mutex,
  SetpointProfile,
  SetpointSensorPair,
  SetpointSimple,
  ProcessView,
  TempSensorMock,
};

export default features;
