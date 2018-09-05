import { Feature } from './state';

import InactiveObject from './InactiveObject';
import OneWireBus from './OneWireBus';
import OneWireTempSensor from './OneWireTempSensor';
import Pid from './Pid';
import Profiles from './Profiles';
import SensorSetPointPair from './SensorSetPointPair';
import SetPointSimple from './SetPointSimple';
import SysInfo from './SysInfo';
import Ticks from './Ticks';

export const blockFeatures: { [key: string]: Feature } = {
  InactiveObject,
  OneWireBus,
  OneWireTempSensor,
  Pid,
  Profiles,
  SensorSetPointPair,
  SetPointSimple,
  SysInfo,
  Ticks,
};
