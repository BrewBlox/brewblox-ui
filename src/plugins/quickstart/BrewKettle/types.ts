import { JSQuantity } from '@/helpers/bloxfield';

import { PinChannel, QuickStartOutput } from '../types';

export interface BrewKettleBlockNames {
  kettleSensor: string;
  kettleSetpoint: string;
  kettlePid: string;
  kettlePwm: string;
  kettleAct: string;
}

export interface BrewKettleConfig extends QuickStartOutput {
  prefix: string;
  names: BrewKettleBlockNames;
  kettlePin: PinChannel;
  kettleSensor: string;
}

export interface BrewKettleOpts {
  kp: JSQuantity;
}
