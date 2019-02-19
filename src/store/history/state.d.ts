import { RootState } from '@/store/state';
import { ActionContext } from 'vuex';

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

export type Slice = number[];

export interface QueryResult {
  name: string;
  columns: string[];
  values: Slice[];
}

export interface Metric {
  id: string;
  transformer: (metric: Metric, result: QueryResult) => Metric;
  params: QueryParams;
  target: QueryTarget;
  renames: DisplayNames;
  source?: EventSource;
  values?: any;
}

export interface HistoryState {
  availableFields: {
    [measurement: string]: string[];
  };
  metrics: {
    [id: string]: Metric;
  };
}

export type HistoryContext = ActionContext<HistoryState, RootState>;
