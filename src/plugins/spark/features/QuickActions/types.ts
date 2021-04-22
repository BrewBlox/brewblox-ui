import { Block } from '@/plugins/spark/types';
import { BlockField } from '@/plugins/spark/types';
import { Widget } from '@/store/widgets';

export interface BlockChange<BlockT extends Block = Block> {
  id: string;
  serviceId: string;
  blockId: string;
  data: Partial<BlockT['data']>;
  confirmed: { [k in keyof BlockT['data']]?: boolean; };
}

export interface ChangeAction {
  id: string;
  name: string;
  changes: BlockChange[];
}

export interface QuickActionsConfig {
  serviceId?: string; // deprecated
  steps?: ChangeAction[]; // deprecated
  actions: ChangeAction[];
  changeIdMigrated: boolean;
  serviceIdMigrated: boolean;
}

export type QuickActionsWidget = Widget<QuickActionsConfig>

export interface EditableBlockField {
  id: string;
  value: any;
  confirmed: boolean;
  specField: BlockField;
}
