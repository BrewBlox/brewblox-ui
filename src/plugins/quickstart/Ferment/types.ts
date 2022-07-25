import { Quantity } from 'brewblox-proto/ts';
import { IoChannelAddress, QuickstartConfig } from '../types';

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

export type FermentMode = 'beer' | 'fridge';

export interface FermentOpts {
  fridgeSetting: Quantity;
  beerSetting: Quantity;
  activeSetpoint: FermentMode;
}

export interface FermentConfig extends QuickstartConfig {
  names: FermentBlockNames;
  heatChannel: IoChannelAddress;
  coolChannel: IoChannelAddress;
  fridgeSensor: string;
  beerSensor: string;
  fermentOpts: FermentOpts;
}
