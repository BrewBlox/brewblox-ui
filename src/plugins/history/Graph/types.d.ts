import { GraphConfig } from '@/components/Graph/types';
import { DashboardItem } from '@/store/dashboards/types';

export interface HistoryItem extends DashboardItem {
  config: GraphConfig;
}
