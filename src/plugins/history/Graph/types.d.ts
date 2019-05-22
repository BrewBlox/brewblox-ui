import { GraphConfig } from '@/components/Graph/types';
import { DashboardItem } from '@/store/types';

export interface HistoryItem extends DashboardItem {
  config: GraphConfig;
}
