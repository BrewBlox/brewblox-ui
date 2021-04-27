import { JSQuantity } from '@/utils/bloxfield';

import { PinChannel, QuickstartConfig } from '../types';

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

export type GlycolControlMode = 'No' | 'Measure' | 'Control'

export interface GlycolConfig extends QuickstartConfig {
  prefix: string;
  names: GlycolBlockNames;
  heated: boolean;
  coolPin: PinChannel;
  heatPin: PinChannel | null;

  glycolPin: PinChannel | null;
  glycolSensor: string;
  beerSensor: string;

  glycolControl: GlycolControlMode;
}

export interface GlycolOpts {
  beerSetting: JSQuantity;
  glycolSetting: JSQuantity;
}
