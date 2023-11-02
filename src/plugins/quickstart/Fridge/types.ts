import { IoChannelAddress, QuickstartConfig } from '../types';
import { Quantity } from 'brewblox-proto/ts';

export interface FridgeConfigNames {
  fridgeSensor: string;
  fridgeSetpoint: string;
  tempProfile: string;
  coolAct: string;
  heatAct: string;
  coolPwm: string;
  heatPwm: string;
  mutex: string;
  coolPid: string;
  heatPid: string;
}

export interface FridgeOpts {
  fridgeSetting: Quantity;
}

export interface FridgeConfig extends QuickstartConfig {
  names: FridgeConfigNames;
  heatChannel: IoChannelAddress;
  coolChannel: IoChannelAddress;
  fridgeSensor: string;
  fridgeOpts: FridgeOpts;
}
