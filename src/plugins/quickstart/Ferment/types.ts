import { Unit } from '@/helpers/units';

import { PinChannel, QuickStartOutput } from '../types';

export interface FermentConfigNames {
  fridgeSensor: string;
  beerSensor: string;
  fridgeSSPair: string;
  beerSSPair: string;
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
  fridgeSetting: Unit;
  beerSetting: Unit;
  activeSetpoint: 'beer' | 'fridge';
}
