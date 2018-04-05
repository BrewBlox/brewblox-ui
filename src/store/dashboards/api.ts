import { Dashboard, DashboardItem } from './state';

import { get, put } from '../../core/fetch';

export function fetchDashboards(): Promise<{ dashboards: Dashboard[], items: DashboardItem[] }> {
  return get('/dashboards/list');
}

export function persistDashboardItem(id: string, newData: any): Promise<DashboardItem> {
  return put(`/dashboards/items/${id}`, newData);
}
