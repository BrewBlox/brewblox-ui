import { Feature } from '@/store/features/state';
import ActuatorAnalogMock from './ActuatorAnalogMock';
import ActuatorDS2413 from './ActuatorDS2413';
import ActuatorOffset from './ActuatorOffset';
import ActuatorPin from './ActuatorPin';
import ActuatorPwm from './ActuatorPwm';
import Balancer from './Balancer';
import BrewPiArrangement from './BrewPiArrangement';
import DisplaySettings from './DisplaySettings';
import DS2413 from './DS2413';
import InactiveObject from './InactiveObject';
import Mutex from './Mutex';
import Pid from './Pid';
import ProcessView from './ProcessView';
import SessionView from './SessionView';
import SetpointProfile from './SetpointProfile';
import SetpointSensorPair from './SetpointSensorPair';
import SetpointSimple from './SetpointSimple';
import TempSensorMock from './TempSensorMock';
import TempSensorOneWire from './TempSensorOneWire';

const features: { [id: string]: Feature } = {
  ActuatorAnalogMock,
  ActuatorDS2413,
  ActuatorOffset,
  ActuatorPin,
  ActuatorPwm,
  Balancer,
  BrewPiArrangement,
  DisplaySettings,
  DS2413,
  InactiveObject,
  Pid,
  Mutex,
  SetpointProfile,
  SetpointSensorPair,
  SetpointSimple,
  ProcessView,
  TempSensorMock,
  TempSensorOneWire,
  SessionView,
};

export default features;
