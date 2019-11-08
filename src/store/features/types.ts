import { PersistentWidget } from '@/store/dashboards';

export type FeatureRole = 'Process' | 'Control' | 'Output' | 'Constraint' | 'Display' | 'Other';
export type WidgetMode = 'Basic' | 'Full';
export type WidgetContainer = 'Dashboard' | 'Dialog';

export interface Crud<ConfigT = any> {
  widget: PersistentWidget<ConfigT>;
  isStoreWidget: boolean;
  saveWidget(widget: PersistentWidget): unknown | Promise<unknown>;
  closeDialog(): void;
}

export interface Deleter {
  description: string;
  action: (crud: Crud) => void;
}

export type WidgetSelector = (crud: Crud) => string;

export interface Feature {
  id: string;
  displayName: string;
  role?: FeatureRole;
  deleters?: Deleter[];
  widgetSize: {
    cols: number;
    rows: number;
  };
  widgetComponent: string | WidgetSelector;
  wizardComponent?: string | null;
  generateConfig?: () => any;
}

export interface QuickStart {
  id: string;
  displayName: string;
  wizardComponent: string;
}

export interface Watcher {
  component: string;
  props: Mapped<any>;
}

export interface WidgetContext {
  mode: WidgetMode;
  container: WidgetContainer;
}
