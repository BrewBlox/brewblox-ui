import { IoChannelAddress, QuickstartConfig } from '../types';
import { Quantity } from 'brewblox-proto/ts';

export interface BrewKettleBlockNames {
  kettleSensor: string;
  kettleSetpoint: string;
  kettlePid: string;
  kettlePwm: string;
  kettleAct: string;
}

export interface BrewKettleOpts {
  kp: Quantity;
}

export interface BrewKettleConfig extends QuickstartConfig {
  names: BrewKettleBlockNames;
  kettleChannel: IoChannelAddress;
  kettleSensor: string;
  kettleOpts: BrewKettleOpts;
}
