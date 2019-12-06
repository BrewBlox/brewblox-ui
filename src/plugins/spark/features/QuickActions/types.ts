import { PersistentWidget } from '@/store/dashboards';

import { Block } from '../../types';

export interface BlockChange<BlockT extends Block = Block> {
  id: string;
  blockId: string;
  data: Partial<BlockT['data']>;
  confirmed: { [k in keyof BlockT['data']]?: boolean; };
}

export interface Step {
  id: string;
  name: string;
  changes: BlockChange[];
}

export interface QuickActionsConfig {
  serviceId: string;
  steps: Step[];
  changeIdMigrated: boolean;
}

export interface QuickActionsItem extends PersistentWidget {
  config: QuickActionsConfig;
}
