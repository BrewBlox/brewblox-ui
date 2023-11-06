import { IoChannelAddress, QuickstartConfig } from '../types';

export type RimsBlockNames = {
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
};

export interface RimsConfig extends QuickstartConfig {
  names: RimsBlockNames;
  tubeChannel: IoChannelAddress;
  pumpChannel: IoChannelAddress;
  kettleSensor: string;
  tubeSensor: string;
}
