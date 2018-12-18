import { Feature } from '@/store/features/state';
import ActuatorAnalogMock from './ActuatorAnalogMock';
import ActuatorOffset from './ActuatorOffset';
import ActuatorPin from './ActuatorPin';
import ActuatorPwm from './ActuatorPwm';
import Balancer from './Balancer';
import DisplaySettings from './DisplaySettings';
import InactiveObject from './InactiveObject';
import Mutex from './Mutex';
import Pid from './Pid';
import ProcessView from './ProcessView';
import SetpointProfile from './SetpointProfile';
import SetpointSensorPair from './SetpointSensorPair';
import SetpointSimple from './SetpointSimple';
import TempSensorMock from './TempSensorMock';
import TempSensorOneWire from './TempSensorOneWire';

const features: { [id: string]: Feature } = {
  ActuatorAnalogMock,
  ActuatorOffset,
  ActuatorPin,
  ActuatorPwm,
  Balancer,
  DisplaySettings,
  InactiveObject,
  Pid,
  Mutex,
  SetpointProfile,
  SetpointSensorPair,
  SetpointSimple,
  ProcessView,
  TempSensorMock,
  TempSensorOneWire,
};

export default features;
