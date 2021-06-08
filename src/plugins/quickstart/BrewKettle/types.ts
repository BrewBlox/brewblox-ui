import { JSQuantity } from '@/utils';

import { PinChannel, QuickstartConfig } from '../types';

export interface BrewKettleBlockNames {
  kettleSensor: string;
  kettleSetpoint: string;
  kettlePid: string;
  kettlePwm: string;
  kettleAct: string;
}

export interface BrewKettleConfig extends QuickstartConfig {
  names: BrewKettleBlockNames;
  kettlePin: PinChannel;
  kettleSensor: string;
}

export interface BrewKettleOpts {
  kp: JSQuantity;
}
