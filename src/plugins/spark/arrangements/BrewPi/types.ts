import { Block } from '@/plugins/spark/types';
import { DashboardItem } from '@/store/dashboards';

export interface PinChannel {
  arrayId: string;
  pinId: number;
  pinName: string;
}

export interface BrewPiConfigNames {
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
  fridgeDriver: string;
  coolPid: string;
  heatPid: string;
  beerPid: string;
  graph: string;
}

export interface BrewPiConfig {
  serviceId: string;
  arrangementId: string;
  prefix: string;
  dashboardId: string;
  dashboardTitle: string;
  groups: number[];
  names: BrewPiConfigNames;
  widgets: DashboardItem[];
  createdBlocks: Block[];
  changedBlocks: Block[];
  renamedBlocks: {
    [old: string]: string;
  };
  heatPin: PinChannel;
  coolPin: PinChannel;
}
