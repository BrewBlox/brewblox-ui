import { GraphConfig } from '@/plugins/history/types';
import { PersistentWidget } from '@/store/dashboards';

export interface HistoryItem extends PersistentWidget {
  config: GraphConfig;
}
