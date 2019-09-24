import { Unit } from '@/helpers/units';

import { PinChannel, QuickStartOutput } from '../types';

export interface GlycolBlockNames {
  beerSensor: string;
  beerSetpoint: string;
  beerProfile: string;

  coolPid: string;
  coolPwm: string;
  coolAct: string;

  heatPid: string;
  heatPwm: string;
  heatAct: string;

  mutex: string;
}

export interface GlycolConfig extends QuickStartOutput {
  title: string;
  prefix: string;
  names: GlycolBlockNames;
  heated: boolean;
  coolPin: PinChannel;
  heatPin: PinChannel | null;
  beerSensor: string;
}

export interface GlycolOpts {
  setting: Unit;
}
