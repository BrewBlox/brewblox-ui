import { FeatureService } from '../state';

import { startup } from './store';

import InactiveObject from './features/InactiveObject';
import OneWireBus from './features/OneWireBus';
import OneWireTempSensor from './features/OneWireTempSensor';
import Pid from './features/Pid';
import Profiles from './features/Profiles';
import SensorSetPointPair from './features/SensorSetPointPair';
import SetPointSimple from './features/SetPointSimple';
import SysInfo from './features/SysInfo';
import Ticks from './features/Ticks';
import ProcessView from './features/ProcessView';

const service: FeatureService = {
  fetch: startup,
  features: {
    InactiveObject,
    OneWireBus,
    OneWireTempSensor,
    Pid,
    Profiles,
    SensorSetPointPair,
    SetPointSimple,
    SysInfo,
    Ticks,
    ProcessView,
  },
};

export default service;
