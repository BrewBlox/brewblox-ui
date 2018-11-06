import { get, put, post, del } from '@/helpers/fetch';

import { Dashboard, DashboardItem } from './state';

export const fetchDashboards = (): Promise<Dashboard[]> =>
  get('/datastore/dashboards');

export const fetchDashboardById = (id: string): Promise<Dashboard> =>
  get(`/datastore/dashboards/${encodeURIComponent(id)}`);

export const createDashboard = (newData: Dashboard): Promise<boolean> =>
  post('/datastore/dashboards', newData);

export const persistDashboard = (dashboard: Dashboard): Promise<Dashboard> =>
  put(`/datastore/dashboards/${encodeURIComponent(dashboard.id)}`, dashboard);

export const deleteDashboard = (dashboard: Dashboard): Promise<Dashboard> =>
  del(`/datastore/dashboards/${encodeURIComponent(dashboard.id)}`, dashboard);

export const fetchDashboardItems = (): Promise<DashboardItem[]> =>
  get('/datastore/dashboard-items');

export const fetchDashboardItemById = (id: string): Promise<DashboardItem> =>
  get(`/datastore/dashboard-items/${encodeURIComponent(id)}`);

export const persistDashboardItem = (item: DashboardItem): Promise<DashboardItem> =>
  put(`/datastore/dashboard-items/${encodeURIComponent(item.id)}`, item);

export const createDashboardItem = (item: DashboardItem): Promise<DashboardItem> =>
  post('/datastore/dashboard-items', item);

export const deleteDashboardItem = (item: DashboardItem): Promise<DashboardItem> =>
  del(`/datastore/dashboard-items/${encodeURIComponent(item.id)}`, item);
