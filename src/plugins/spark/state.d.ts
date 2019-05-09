import { DashboardItem } from '@/store/dashboards/state';
import { Service } from '@/store/services/state';

export interface SparkConfig {
  groupNames: string[];
}

export interface Spark extends Service {
  config: SparkConfig;
}

export interface DataBlock {
  id: string;
  nid?: number;
  type: string;
  groups: number[];
  data: any;
}

export interface Block extends DataBlock {
  serviceId: string;
}

export interface BlockConfig {
  serviceId: string;
  blockId: string;
}

export interface DashboardBlock extends DashboardItem {
  config: BlockConfig;
}

export interface UserUnits {
  [key: string]: string;
}

export interface UnitAlternatives {
  [key: string]: string[];
}

export interface CompatibleBlocks {
  [key: string]: string[];
}

export interface SystemStatus {
  checkedAt: Date;
  available: boolean;
  connected: boolean;
  synchronized: boolean;
  error?: any;
}

export interface BlockLink {
  source: string;
  target: string;
  relation: string[];
}
