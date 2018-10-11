import { DashboardItem } from '@/store/dashboards/state';
import { QueryParams } from '@/plugins/history/state';
import { Layout } from 'plotly.js';

export interface GraphConfig {
  serviceId: string;
  layout: Partial<Layout>;
  params: QueryParams[];
}

export interface HistoryItem extends DashboardItem {
  config: GraphConfig;
}
