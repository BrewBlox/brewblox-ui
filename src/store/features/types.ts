export interface Deleter {
  description: string;
  action: (config: any) => void;
}

export type Validator = (config: any) => boolean;
export type WidgetSelector = (config: any) => string | undefined;

export interface Feature {
  id: string;
  displayName: string;
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

export interface FeatureState {
  features: {
    [id: string]: Feature;
  };
  arrangements: {
    [id: string]: Arrangement;
  };
}
