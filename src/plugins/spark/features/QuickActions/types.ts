import { BlockFieldSpec } from '@/plugins/spark/types';
import { Widget } from '@/store/widgets';
import { Block } from 'brewblox-proto/ts';

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

export interface QuickActionsConfigOld {
  serviceId?: string;
  steps?: ChangeAction[];
}

export interface QuickActionsConfig {
  version: '1.1';
  actions: ChangeAction[];
  lastActionId?: string;
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
