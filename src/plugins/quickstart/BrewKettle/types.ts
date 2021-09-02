import { Quantity } from '@/shared-types';

import { IoChannelAddress, QuickstartConfig } from '../types';

export interface BrewKettleBlockNames {
  kettleSensor: string;
  kettleSetpoint: string;
  kettlePid: string;
  kettlePwm: string;
  kettleAct: string;
}

export interface BrewKettleConfig extends QuickstartConfig {
  names: BrewKettleBlockNames;
  kettlePin: IoChannelAddress;
  kettleSensor: string;
}

export interface BrewKettleOpts {
  kp: Quantity;
}
