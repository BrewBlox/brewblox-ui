import { Block } from '@/plugins/spark/types';
import { BlockFieldSpec } from '@/plugins/spark/types';
import { Widget } from '@/store/widgets';

export interface BlockChange<BlockT extends Block = Block> {
  id: string;
  serviceId: string;
  blockId: string;
  data: Partial<BlockT['data']>;
  confirmed: { [k in keyof BlockT['data']]?: boolean };
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
  lastActionId?: string;
  changeIdMigrated: boolean;
  serviceIdMigrated: boolean;
}

export interface QuickActionsChange {
  id: string;
  type: string;
  config: unknown;

  confirmed?: boolean;
}

export interface QuickActionsSpec {
  id: string;
  title: string;
  pretty: (config: unknown) => string;
  generate: () => unknown;
  component: string;
  componentProps?: AnyDict;
}

export type QuickActionsWidget = Widget<QuickActionsConfig>;

export interface EditableBlockField {
  id: string;
  value: any;
  confirmed: boolean;
  specField: BlockFieldSpec;
}
