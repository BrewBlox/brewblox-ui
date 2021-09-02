import { Quantity } from '@/shared-types';

import { IoChannelAddress, QuickstartConfig } from '../types';

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

export type GlycolControlMode = 'No' | 'Measure' | 'Control';

export interface GlycolConfig extends QuickstartConfig {
  names: GlycolBlockNames;
  heated: boolean;
  coolPin: IoChannelAddress;
  heatPin: IoChannelAddress | null;

  glycolPin: IoChannelAddress | null;
  glycolSensor: string;
  beerSensor: string;

  glycolControl: GlycolControlMode;
}

export interface GlycolOpts {
  beerSetting: Quantity;
  glycolSetting: Quantity;
}
