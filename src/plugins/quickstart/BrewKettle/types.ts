import { Quantity } from 'brewblox-proto/ts';
import { IoChannelAddress, QuickstartConfig } from '../types';

export type BrewKettleBlockNames = {
  kettleSensor: string;
  kettleSetpoint: string;
  kettlePid: string;
  kettlePwm: string;
  kettleAct: string;
};

export interface BrewKettleOpts {
  kp: Quantity;
}

export interface BrewKettleConfig extends QuickstartConfig {
  names: BrewKettleBlockNames;
  kettleChannel: IoChannelAddress;
  kettleSensor: string;
  kettleOpts: BrewKettleOpts;
}
