import { Quantity } from 'brewblox-proto/ts';
import { IoChannelAddress, QuickstartConfig } from '../types';

export type HermsBlockNames = {
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
};

export interface HermsOpts {
  hltKp: Quantity;
  bkKp: Quantity;
  mtKp: Quantity;
  driverMax: Quantity;
}

export interface HermsConfig extends QuickstartConfig {
  names: HermsBlockNames;
  hltChannel: IoChannelAddress;
  bkChannel: IoChannelAddress;
  mutex: boolean;
  hltSensor: string;
  mtSensor: string;
  bkSensor: string;
  hermsOpts: HermsOpts;
}
