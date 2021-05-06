import { QueryConfig } from '@/plugins/history/types';
import { Widget } from '@/store/widgets';

export interface MetricsConfig extends QueryConfig {
  freshDuration: Mapped<number>;
  decimals: Mapped<number>;
}

export type MetricsWidget = Widget<MetricsConfig>
