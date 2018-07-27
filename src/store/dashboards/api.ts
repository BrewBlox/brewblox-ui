import { get, put, post } from '@/core/fetch';
import { spreadData, unspreadData } from '@/core/api-spread';

import { Dashboard, DashboardItem, DashboardAPI } from './state';

export function fetchDashboards(): Promise<Dashboard[]> {
  return get('/datastore/dashboards')
    .then(dashboards => dashboards.map((dashboard: DashboardAPI) => spreadData(dashboard)));
}

export function createDashboard(dashboard: Dashboard): Promise<boolean> {
  return post('/datastore/dashboards', unspreadData(dashboard))
    .then(dashboards => dashboards.map((item: DashboardAPI) => spreadData(item)));
}

export function persistDashboard(id: string, newData: any): Promise<Dashboard> {
  return put(`/datastore/dashboards/${encodeURIComponent(id)}`, unspreadData(newData))
    .then(item => spreadData(item));
}

export function fetchDashboardItems(): Promise<DashboardItem[]> {
  return get('/datastore/dashboard-items')
    .then(dashboardItems => dashboardItems.map((item: any) => spreadData(item)));
}

export function persistDashboardItem(id: string, newData: any): Promise<DashboardItem> {
  return put(`/datastore/dashboard-items/${encodeURIComponent(id)}`, unspreadData(newData))
    .then(item => spreadData(item));
}

export function createDashboardItem(newData: any): Promise<DashboardItem> {
  return post('/datastore/dashboard-items/', unspreadData(newData))
    .then(item => spreadData(item));
}
