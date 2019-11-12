import { QueryConfig } from '@/plugins/history/types';

export interface MetricsConfig extends QueryConfig {
  freshDuration: Mapped<number>;
  decimals: Mapped<number>;
}
