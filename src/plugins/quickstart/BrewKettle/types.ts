import { Quantity } from '@/shared-types';

import { IoChannelAddress, QuickstartConfig } from '../types';

export interface BrewKettleBlockNames {
  kettleSensor: string;
  kettleSetpoint: string;
  kettlePid: string;
  kettlePwm: string;
  kettleAct: string;
}

export interface BrewKettleOpts {
  kp: Quantity;
}

export interface BrewKettleConfig extends QuickstartConfig {
  names: BrewKettleBlockNames;
  kettleChannel: IoChannelAddress;
  kettleSensor: string;
  kettleOpts: BrewKettleOpts;
}
