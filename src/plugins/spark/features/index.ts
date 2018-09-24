import { Feature } from '@/store/features/state';

import ActuatorAnalogMock from './ActuatorAnalogMock';
import InactiveObject from './InactiveObject';
import TempSensorOneWire from './TempSensorOneWire';
import Pid from './Pid';
import SetpointSensorPair from './SetpointSensorPair';
import SetpointSimple from './SetpointSimple';
import ProcessView from './ProcessView';
import TempSensorMock from './TempSensorMock';

const features: { [id: string]: Feature } = {
  ActuatorAnalogMock,
  InactiveObject,
  TempSensorOneWire,
  Pid,
  SetpointSensorPair,
  SetpointSimple,
  ProcessView,
  TempSensorMock,
};

export default features;
