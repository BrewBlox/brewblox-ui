import { Quantity } from 'brewblox-proto/ts';
import { IoChannelAddress, QuickstartConfig } from '../types';

export type GlycolBlockNames = {
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
};

export type GlycolControlMode = 'No' | 'Measure' | 'Control';

export interface GlycolOpts {
  beerSetting: Quantity;
  glycolSetting: Quantity;
}

export interface GlycolConfig extends QuickstartConfig {
  names: GlycolBlockNames;
  heated: boolean;
  coolChannel: IoChannelAddress;
  heatChannel: IoChannelAddress | null;

  glycolChannel: IoChannelAddress | null;
  glycolSensor: string;
  beerSensor: string;

  glycolControl: GlycolControlMode;
  glycolOpts: GlycolOpts;
}
