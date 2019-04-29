import { QueryTarget, DisplayNames, QueryParams } from '@/store/history/state';

export interface MetricsResult {
  field: string;
  time: number | null;
  value: number | null;
}

export interface MetricsConfig {
  params: QueryParams;
  targets: QueryTarget[];
  renames: DisplayNames;
  freshDuration: {
    [key: string]: number;
  };
}
