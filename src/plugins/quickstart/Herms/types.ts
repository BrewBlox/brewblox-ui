import { Quantity } from '@/shared-types';

import { PinChannel, QuickstartConfig } from '../types';

export interface HermsBlockNames {
  hltSensor: string;
  hltDriver: string;
  hltSetpoint: string;
  hltPid: string;
  hltPwm: string;
  hltAct: string;

  mtSensor: string;
  mtSetpoint: string;
  mtPid: string;

  bkSensor: string;
  bkSetpoint: string;
  bkPid: string;
  bkPwm: string;
  bkAct: string;

  mutex: string;
  balancer: string;
}

export interface HermsConfig extends QuickstartConfig {
  names: HermsBlockNames;
  hltPin: PinChannel;
  bkPin: PinChannel;
  mutex: boolean;
  hltSensor: string;
  mtSensor: string;
  bkSensor: string;
}

export interface HermsOpts {
  hltKp: Quantity;
  bkKp: Quantity;
  mtKp: Quantity;
  driverMax: Quantity;
}
