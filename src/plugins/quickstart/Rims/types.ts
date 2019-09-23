import { Unit } from '@/helpers/units';

import { PinChannel, QuickStartOutput } from '../types';

export interface RimsBlockNames {
  kettleSensor: string;
  kettleSetpoint: string;
  kettlePid: string;
  kettlePwm: string;
  kettleAct: string;

  mashSetpoint: string;
  mashPid: string;
  mashPwm: string;
  mashAct: string;

  pumpAct: string;
}

export interface RimsConfig extends QuickStartOutput {
  title: string;
  prefix: string;
  names: RimsBlockNames;
  kettlePin: PinChannel;
  mashPin: PinChannel;
  pumpPin: PinChannel;
}

export interface RimsOpts {
  kettleSetting: Unit;
  mashSetting: Unit;
}
