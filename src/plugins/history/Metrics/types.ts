import { QueryConfig } from '@/store/history';

export interface MetricsResult {
  field: string;
  time: number | null;
  value: number | null;
}

export interface MetricsConfig extends QueryConfig {
  freshDuration: Record<string, number>;
  decimals: Record<string, number>;
}
