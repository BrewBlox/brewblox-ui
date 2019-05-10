import { DashboardItem } from '@/store/dashboards/types';

export interface ExampleWidgetConfig {
  lastUrl: string;
}

export interface ExampleItem extends DashboardItem {
  // A dashboard item can store persistent configuration here.
  // Config must be JSON serializable.
  config: ExampleWidgetConfig;
}
