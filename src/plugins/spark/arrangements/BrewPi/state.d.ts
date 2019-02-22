import { Block } from '@/plugins/spark/state';

export interface BrewPiConfigNames {
  fridgeSensor: string;
  beerSensor: string;
  fridgeSetpoint: string;
  beerSetpoint: string;
  fridgeSSPair: string;
  beerSSPair: string;
  coolPin: string;
  heatPin: string;
  coolPwm: string;
  heatPwm: string;
  mutex: string;
  coolPid: string;
  heatPid: string;
  beerPid: string;
  fridgeOffset: string;
}

export interface BrewPiConfig {
  serviceId: string;
  arrangementId: string;
  prefix: string;
  dashboardId: string;
  groups: number[];
  names: BrewPiConfigNames;
  blocks: {
    [id: string]: Block;
  };
  createdBlocks: string[];
  renamedBlocks: {
    [old: string]: string;
  };
}
