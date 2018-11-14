import { DashboardItem } from '@/store/dashboards/state';
import { GraphConfig } from '@/components/Graph/state';

export interface HistoryItem extends DashboardItem {
  config: GraphConfig;
}
