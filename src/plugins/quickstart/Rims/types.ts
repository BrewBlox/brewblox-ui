import { Unit } from '@/helpers/units';

import { PinChannel, QuickStartOutput } from '../types';

export interface RimsBlockNames {
  kettleSensor: string;
  kettleSetpoint: string;
  kettlePid: string;
  kettlePwm: string;
  kettleAct: string;

  tubeDriverPid: string;
  tubeDriver: string;
  tubeSensor: string;
  tubeSetpoint: string;
  tubePid: string;
  tubePwm: string;
  tubeAct: string;

  pumpAct: string;

  mutex: string;
  balancer: string;
}

export interface RimsConfig extends QuickStartOutput {
  title: string;
  prefix: string;
  names: RimsBlockNames;
  kettlePin: PinChannel;
  tubePin: PinChannel;
  pumpPin: PinChannel;
  kettleSensor: string;
  tubeSensor: string;
}

export interface RimsOpts {
  kettleSetting: Unit;
}
