import { JSQuantity } from '@/helpers/bloxfield';

import { PinChannel, QuickStartOutput } from '../types';

export interface FermentConfigNames {
  fridgeSensor: string;
  beerSensor: string;
  fridgeSetpoint: string;
  beerSetpoint: string;
  tempProfile: string;
  coolAct: string;
  heatAct: string;
  coolPwm: string;
  heatPwm: string;
  mutex: string;
  coolPid: string;
  heatPid: string;
}

export interface FermentConfig extends QuickStartOutput {
  prefix: string;
  names: FermentConfigNames;
  heatPin: PinChannel;
  coolPin: PinChannel;
  fridgeSensor: string;
  beerSensor: string;
}

export interface FermentOpts {
  fridgeSetting: JSQuantity;
  beerSetting: JSQuantity;
  activeSetpoint: 'beer' | 'fridge';
}
