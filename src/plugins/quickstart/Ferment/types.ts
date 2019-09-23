import { PinChannel, QuickStartOutput } from '../types';

export interface FermentConfigNames {
  fridgeSensor: string;
  beerSensor: string;
  fridgeSSPair: string;
  beerSSPair: string;
  tempProfile: string;
  coolAct: string;
  heatAct: string;
  coolPwm: string;
  heatPwm: string;
  mutex: string;
  coolPid: string;
  heatPid: string;
}

export interface FermentConfig extends QuickStartOutput {
  title: string;
  prefix: string;
  groups: number[];
  names: FermentConfigNames;
  heatPin: PinChannel;
  coolPin: PinChannel;
}
