import { DashboardItem } from '@/store/dashboards/state';

export interface ExampleWidgetConfig {
  lastUrl: string;
}

export interface ExampleItem extends DashboardItem {
  // A dashboard item can store persistent configuration here
  // Config must be JSON serializable, but there are no other restrictions
  config: ExampleWidgetConfig;
}
