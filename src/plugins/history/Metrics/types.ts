import { QueryConfig } from '@/plugins/history/types';

export interface MetricsResult {
  field: string;
  time: number | null;
  value: number | null;
}

export interface MetricsConfig extends QueryConfig {
  freshDuration: Mapped<number>;
  decimals: Mapped<number>;
}
