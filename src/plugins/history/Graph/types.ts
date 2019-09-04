import { GraphConfig } from '@/components/Graph/types';
import { DashboardItem } from '@/store/dashboards';

export interface HistoryItem extends DashboardItem {
  config: GraphConfig;
}
