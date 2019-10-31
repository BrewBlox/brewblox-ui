import { PersistentWidget } from '@/store/dashboards';

export interface QuickActionsConfig {
  serviceId: string;
  steps: Step[];
}

export interface QuickActionsItem extends PersistentWidget {
  config: QuickActionsConfig;
}

export interface BlockChange {
  blockId: string;
  data: {
    [key: string]: any;
  };
  confirmed: {
    [key: string]: boolean;
  };
}

export interface Step {
  id: string;
  name: string;
  changes: BlockChange[];
}
