import { DashboardItem } from '@/store/dashboards';

export interface ExampleWidgetConfig {
  lastUrl: string;
}

export interface ExampleItem extends DashboardItem {
  // A dashboard item can store persistent configuration here.
  // Config must be JSON serializable.
  config: ExampleWidgetConfig;
}
