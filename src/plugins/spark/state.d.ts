import { Service } from '@/store/services/state';
import { DashboardItem } from '@/store/dashboards/state';

export interface Spark extends Service {
  config: {
    profileNames: string[];
  };
}

export interface DataBlock {
  id: string;
  type: string;
  profiles: number[];
  data: Object;
}

export interface Block extends DataBlock {
  serviceId: string;
  isLoading?: boolean;
}

export interface DashboardBlock extends DashboardItem {
  config: {
    serviceId: string;
    blockId: string;
  };
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
