import { Dashboard, DashboardItem } from './state';

import { get } from '../../core/fetch';

export function fetchDashboards(): Promise<{ dashboards: Dashboard[], items: DashboardItem[] }> {
  return get('/dashboards/list');
}
