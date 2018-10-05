import { Service } from '@/store/services/state';
import { DashboardItem } from '@/store/dashboards/state';

export interface History extends Service {
  config: {};
}

export interface HistoryOptions {
  measurement: string;
  keys: string[];
  database?: string;
  start?: string;
  duration?: string;
  end?: string;
  limit?: number;
  orderBy?: string;
  approxPoints?: number;
}

export type Slice = number[];

export interface Metric {
  id: string;
  serviceId: string;
  options: HistoryOptions;
  transformer: (metric: Metric, slices: Slice[]) => Metric;
  source?: EventSource;
  config?: any;
  values?: any;
}

export interface GraphConfig {
  title: string;
  serviceId: string;
  options: HistoryOptions;
}

export interface HistoryItem extends DashboardItem {
  config: GraphConfig;
}
