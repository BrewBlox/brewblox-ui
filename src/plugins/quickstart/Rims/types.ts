import { IoChannelAddress, QuickstartConfig } from '../types';

export interface RimsBlockNames {
  kettleSensor: string;
  kettleSetpoint: string;
  kettlePid: string;

  tubeSensor: string;
  tubeDriver: string;
  tubeSetpoint: string;
  tubePid: string;
  tubePwm: string;
  tubeAct: string;

  pumpAct: string;
}

export interface RimsConfig extends QuickstartConfig {
  names: RimsBlockNames;
  tubePin: IoChannelAddress;
  pumpPin: IoChannelAddress;
  kettleSensor: string;
  tubeSensor: string;
}
