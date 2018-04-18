import { Dashboard, DashboardItem } from './state';

import { get, put, post } from '@/core/fetch';

export function fetchDashboards(): Promise<Dashboard[]> {
  return get('/dashboards');
}

export function createDashboard(dashboard: Dashboard): Promise<boolean> {
  return post('/dashboards', dashboard);
}

export function fetchDashboardItems(): Promise<DashboardItem[]> {
  return get('/dashboard-items');
}

export function persistDashboardItem(id: string, newData: any): Promise<DashboardItem> {
  return put(`/dashboards-items/${id}`, newData);
}
