export type Validator = (config: any) => boolean;
export type WidgetSelector = (config: any) => string;
export type FeatureRole = 'Process' | 'Control' | 'Output' | 'Constraint' | 'Display' | 'Other';
export type WidgetMode = 'Basic' | 'Full';
export type WidgetContainer = 'Dashboard' | 'Dialog';

export interface Deleter {
  description: string;
  action: (config: any) => void;
}

export interface Feature {
  id: string;
  displayName: string;
  role?: FeatureRole;
  validator?: Validator;
  deleters?: Deleter[];
  widgetSize: {
    cols: number;
    rows: number;
  };
  widget: string | WidgetSelector;
  wizard?: string;
  form?: string;
}

export interface QuickStart {
  id: string;
  displayName: string;
  wizard: string;
}

export interface Watcher {
  component: string;
  props: Mapped<any>;
}

export interface WidgetContext {
  mode: WidgetMode;
  container: WidgetContainer;
}
