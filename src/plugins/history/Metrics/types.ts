import { DisplayNames, QueryParams,QueryTarget } from '@/store/history';

export interface MetricsResult {
  field: string;
  time: number | null;
  value: number | null;
}

export interface MetricsConfig {
  params: QueryParams;
  targets: QueryTarget[];
  renames: DisplayNames;
  freshDuration: Record<string, number>;
  decimals: Record<string, number>;
}
