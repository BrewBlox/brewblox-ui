import { PersistentWidget } from '@/store/dashboards';

export interface StepViewConfig {
  serviceId: string;
  steps: Step[];
}

export interface StepViewItem extends PersistentWidget {
  config: StepViewConfig;
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
