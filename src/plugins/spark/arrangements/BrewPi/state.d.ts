import { Block } from '@/plugins/spark/state';
import { DashboardItem } from '@/store/dashboards/state';

export interface BrewPiConfigNames {
  fridgeSensor: string;
  beerSensor: string;
  fridgeSSPair: string;
  beerSSPair: string;
  tempProfile: string;
  coolPin: string;
  heatPin: string;
  coolPwm: string;
  heatPwm: string;
  mutex: string;
  fridgeOffset: string;
  coolPid: string;
  heatPid: string;
  beerPid: string;
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
}
