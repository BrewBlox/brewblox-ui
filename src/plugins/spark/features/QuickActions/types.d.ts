import { PersistentWidget } from '@/store/dashboards';

import { Block } from '../../types';

export interface QuickActionsConfig {
  serviceId: string;
  steps: Step[];
}

export interface QuickActionsItem extends PersistentWidget {
  config: QuickActionsConfig;
}

export interface BlockChange<BlockT extends Block = Block> {
  blockId: string;
  data: Partial<BlockT['data']>;
  confirmed: {
    [key: string]: boolean;
  };
}

export interface Step {
  id: string;
  name: string;
  changes: BlockChange[];
}
