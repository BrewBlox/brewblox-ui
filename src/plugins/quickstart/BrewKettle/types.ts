import { JSQuantity } from '@/utils/bloxfield';

import { PinChannel, QuickstartConfig } from '../types';

export interface BrewKettleBlockNames {
  kettleSensor: string;
  kettleSetpoint: string;
  kettlePid: string;
  kettlePwm: string;
  kettleAct: string;
}

export interface BrewKettleConfig extends QuickstartConfig {
  prefix: string;
  names: BrewKettleBlockNames;
  kettlePin: PinChannel;
  kettleSensor: string;
}

export interface BrewKettleOpts {
  kp: JSQuantity;
}
