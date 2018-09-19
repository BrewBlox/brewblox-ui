import { Service } from '@/store/services/state';

export interface History extends Service {
  config: {};
}

type Value = string | number[];

interface Series {
  name: string; // eslint-disable-line no-restricted-globals
  columns: string[];
  values: Value[];
}

export interface MetricsBase {
  metrics: Series[];
}
