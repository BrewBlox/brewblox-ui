import { get, put, post, del } from '@/helpers/fetch';

import { Dashboard, DashboardItem } from './state';

export function fetchDashboards(): Promise<Dashboard[]> {
  return get('/datastore/dashboards');
}

export function fetchDashboardById(id: string): Promise<Dashboard> {
  return get(`/datastore/dashboards/${encodeURIComponent(id)}`);
}

export function createDashboard(newData: Dashboard): Promise<boolean> {
  return post('/datastore/dashboards', newData);
}

export function persistDashboard(dashboard: Dashboard): Promise<Dashboard> {
  return put(`/datastore/dashboards/${encodeURIComponent(dashboard.id)}`, dashboard);
}

export function deleteDashboard(dashboard: Dashboard): Promise<Dashboard> {
  return del(`/datastore/dashboards/${encodeURIComponent(dashboard.id)}`, dashboard);
}

export function fetchDashboardItems(): Promise<DashboardItem[]> {
  return get('/datastore/dashboard-items');
}

export function fetchDashboardItemById(id: string): Promise<DashboardItem> {
  return get(`/datastore/dashboard-items/${encodeURIComponent(id)}`);
}

export function persistDashboardItem(item: DashboardItem): Promise<DashboardItem> {
  return put(`/datastore/dashboard-items/${encodeURIComponent(item.id)}`, item);
}

export function createDashboardItem(item: DashboardItem): Promise<DashboardItem> {
  return post('/datastore/dashboard-items/', item);
}

export function deleteDashboardItem(item: DashboardItem): Promise<DashboardItem> {
  return del(`/datastore/dashboard-items/${encodeURIComponent(item.id)}`, item);
}
