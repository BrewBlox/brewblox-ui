import { DashboardItem } from '@/store/dashboards/state';
import { QueryParams, QueryTarget } from '@/plugins/history/state';
import { Layout } from 'plotly.js';

export interface GraphConfig {
  serviceId: string;
  layout: Partial<Layout>;
  params: QueryParams;
  targets: QueryTarget[];
}

export interface HistoryItem extends DashboardItem {
  config: GraphConfig;
}
