import { GraphConfig } from '@/components/Graph/types';
import { PersistentWidget } from '@/store/dashboards';

export interface HistoryItem extends PersistentWidget {
  config: GraphConfig;
}
