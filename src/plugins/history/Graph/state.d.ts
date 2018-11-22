import { GraphConfig } from '@/components/Graph/state';
import { DashboardItem } from '@/store/dashboards/state';

export interface HistoryItem extends DashboardItem {
  config: GraphConfig;
}
