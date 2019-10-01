import { BuilderLayout } from '@/plugins/builder/types';
import { Block } from '@/plugins/spark/types';
import { DashboardItem } from '@/store/dashboards';

export interface PinChannel {
  arrayId: string;
  pinId: number;
  pinName: string;
}

export interface QuickStartOutput {
  serviceId: string;
  dashboardId: string;
  dashboardTitle: string;
  layouts: BuilderLayout[];
  widgets: DashboardItem[];
  createdBlocks: Block[];
  changedBlocks: Block[];
  renamedBlocks: {
    [old: string]: string;
  };
}
