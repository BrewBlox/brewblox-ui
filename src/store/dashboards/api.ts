import { Dashboard, DashboardItem } from './state';

import { get, post } from '../../core/fetch';

export function fetchDashboards(): Promise<{ dashboards: Dashboard[], items: DashboardItem[] }> {
  return get('/dashboards/list');
}

export function persistDashboardItem(id: string, newData: any): Promise<DashboardItem> {
  return post(`/dashboards/items/${id}`, newData);
}
