import { PinChannel, QuickstartConfig } from '../types';

export interface RimsBlockNames {
  kettleSensor: string;
  kettleSetpoint: string;
  kettlePid: string;

  tubeSensor: string;
  tubeDriver: string;
  tubeSetpoint: string;
  tubePid: string;
  tubePwm: string;
  tubeAct: string;

  pumpAct: string;
}

export interface RimsConfig extends QuickstartConfig {
  prefix: string;
  names: RimsBlockNames;
  tubePin: PinChannel;
  pumpPin: PinChannel;
  kettleSensor: string;
  tubeSensor: string;
}
