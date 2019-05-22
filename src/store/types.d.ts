// Dashboards

export interface Dashboard {
  id: string;
  title: string;
  order: number;
  primary?: boolean;
  _rev?: string;
}

export interface DashboardItem {
  id: string;
  title: string;
  cols: number;
  rows: number;
  order: number;
  dashboard: string;
  feature: string;
  config: any;
  pinnedPosition?: XYPosition | null;
  _rev?: string;
}

export interface Deleter {
  description: string;
  action: (config: any) => void;
}

// Features

export type Validator = (config: any) => boolean;
export type WidgetSelector = (config: any) => string | undefined;
export type FeatureRole = 'Process' | 'Control' | 'Output' | 'Display' | 'Other';

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

// History

export interface QueryParams {
  database?: string;
  start?: string | number;
  duration?: string;
  end?: string | number;
  limit?: number;
  orderBy?: string;
  approxPoints?: number;
}

export interface QueryTarget {
  measurement: string;
  fields: string[];
}

export interface DisplayNames {
  [key: string]: string;
}

export interface GraphValueAxes {
  [key: string]: 'y' | 'y2';
}

export type Slice = number[];

export interface QueryResult {
  name: string;
  columns: string[];
  values: Slice[];
  database: string;
  policy: string;
}

export interface Listener {
  id: string;
  transformer: (listener: any, result: any) => Listener;
  params: QueryParams;
  target: QueryTarget;
  renames: DisplayNames;
  source?: EventSource;
  values?: any;
}

export interface GraphValuesListener extends Listener {
  axes: GraphValueAxes;
  usedPolicy?: string;
}

// Services

export interface Service {
  id: string;
  title: string;
  order: number;
  type: string;
  config: Record<string, any>;
  _rev?: string;
}

// Providers

export interface Provider {
  id: string;
  displayName?: string;
  features: string[];
  onAdd: (service: Service) => Promise<any>;
  onRemove?: (service: Service) => Promise<any>;
  onFetch?: (service: Service) => Promise<any>;
  wizard?: string;
  page?: string;
  watcher?: string;
}
