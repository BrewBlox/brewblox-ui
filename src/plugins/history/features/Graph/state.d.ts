import { DashboardItem } from '@/store/dashboards/state';
import { HistoryOptions } from '@/plugins/history/state';
import { Layout } from 'plotly.js';

export interface GraphConfig {
  title: string;
  serviceId: string;
  layout: Partial<Layout>;
  options: HistoryOptions[];
}

export interface HistoryItem extends DashboardItem {
  config: GraphConfig;
}
