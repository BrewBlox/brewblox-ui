import { Service } from '@/store/services/state';
import { DashboardItem } from '@/store/dashboards/state';

export interface History extends Service {
  config: {};
}

export interface QueryParams {
  database?: string;
  start?: string;
  duration?: string;
  end?: string;
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

export type Slice = number[];

export interface QueryResult {
  name: string;
  columns: string[];
  values: Slice[];
}

export interface Metric {
  id: string;
  serviceId: string;
  transformer: (metric: Metric, result: QueryResult) => Metric;
  params: QueryParams;
  target: QueryTarget;
  renames: DisplayNames;
  source?: EventSource;
  values?: any;
}
