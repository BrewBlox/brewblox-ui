import { Block } from '@/plugins/spark/state';
import { DashboardItem } from '@/store/dashboards/state';

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
  widgets: DashboardItem[];
  createdBlocks: Block[];
  updatedBlocks: Block[];
  renamedBlocks: {
    [old: string]: string;
  };
}
