import { Unit } from '@/plugins/spark/units';

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

  glycolSensor: string;

  glycolSetpoint: string;
  glycolPid: string;
  glycolPwm: string;

  glycolAct: string;
}

export interface GlycolConfig extends QuickStartOutput {
  prefix: string;
  names: GlycolBlockNames;
  heated: boolean;
  coolPin: PinChannel;
  heatPin: PinChannel | null;

  glycolPin: PinChannel | null;
  glycolSensor: string;
  beerSensor: string;

  glycolControl: 'No' | 'Measure' | 'Control';
}

export interface GlycolOpts {
  beerSetting: Unit;
  glycolSetting: Unit;
}
