export type Validator = (config: any) => boolean;
export type WidgetSelector = (config: any) => string | undefined;
export type FeatureRole = 'Process' | 'Control' | 'Output' | 'Constraint' | 'Display' | 'Other';

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
  widgetSize?: {
    cols: number;
    rows: number;
  };
  widget?: string;
  selector?: WidgetSelector;
  wizard?: string;
  form?: string;
}

export interface Arrangement {
  id: string;
  displayName: string;
  wizard: string;
}
