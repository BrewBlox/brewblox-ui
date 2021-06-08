import { JSQuantity } from '@/utils';

import { PinChannel, QuickstartConfig } from '../types';

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

export interface FridgeConfig extends QuickstartConfig {
  names: FridgeConfigNames;
  heatPin: PinChannel;
  coolPin: PinChannel;
  fridgeSensor: string;
}

export interface FridgeOpts {
  fridgeSetting: JSQuantity;
}
