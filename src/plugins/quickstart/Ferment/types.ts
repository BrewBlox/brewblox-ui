import { Quantity } from '@/shared-types';

import { PinChannel, QuickstartConfig } from '../types';

export interface FermentBlockNames {
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

export interface FermentConfig extends QuickstartConfig {
  names: FermentBlockNames;
  heatPin: PinChannel;
  coolPin: PinChannel;
  fridgeSensor: string;
  beerSensor: string;
}

export type FermentMode = 'beer' | 'fridge';

export interface FermentOpts {
  fridgeSetting: Quantity;
  beerSetting: Quantity;
  activeSetpoint: FermentMode;
}
