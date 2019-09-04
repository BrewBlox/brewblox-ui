import { BuilderLayout } from '@/plugins/builder/types';
import { Block } from '@/plugins/spark/types';
import { DashboardItem } from '@/store/dashboards';

export interface PinChannel {
  arrayId: string;
  pinId: number;
  pinName: string;
}

export interface HermsBlockNames {
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
}

export interface HermsConfig {
  serviceId: string;
  arrangementId: string;
  prefix: string;
  dashboardId: string;
  dashboardTitle: string;
  names: HermsBlockNames;
  layouts: BuilderLayout[];
  widgets: DashboardItem[];
  createdBlocks: Block[];
  changedBlocks: Block[];
  renamedBlocks: {
    [old: string]: string;
  };
  hltPin: PinChannel;
  bkPin: PinChannel;
}
