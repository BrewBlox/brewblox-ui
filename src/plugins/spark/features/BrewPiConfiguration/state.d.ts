import { Block } from '@/plugins/spark/state';


export interface BrewPiCfgConfig {
  serviceId: string;
  dashboardId: string;
  groups: string[];
  names: {
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
  };
  blocks: {
    [id: string]: Block;
  };
  createdBlocks: string[];
  renamedBlocks: {
    [old: string]: string;
  };
}
