import { Block } from '@/plugins/spark/types';
import { BlockField } from '@/plugins/spark/types';

export interface BlockChange<BlockT extends Block = Block> {
  id: string;
  serviceId: string | null;
  blockId: string | null;
  data: Partial<BlockT['data']>;
  confirmed: { [k in keyof BlockT['data']]?: boolean; };
}

export interface Step {
  id: string;
  name: string;
  changes: BlockChange[];
}

export interface QuickActionsConfig {
  serviceId?: string; // deprecated
  steps: Step[];
  changeIdMigrated: boolean;
  serviceIdMigrated: boolean;
}

export interface EditableBlockField {
  id: string;
  value: any;
  confirmed: boolean;
  specField: BlockField;
}
