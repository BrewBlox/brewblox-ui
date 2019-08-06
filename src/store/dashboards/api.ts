import database from '@/plugins/database';

import { Dashboard, DashboardItem } from './types';

const DASHBOARDS = 'dashboards';
const ITEMS = 'dashboard-items';

export const setupDashboards =
  (onChanged: (doc: any) => void, onDeleted: (id: string) => void): void =>
    database.registerModule({ onChanged, onDeleted, id: DASHBOARDS });

export const setupDashboardItems =
  (onChanged: (doc: any) => void, onDeleted: (id: string) => void): void =>
    database.registerModule({ onChanged, onDeleted, id: ITEMS });

export const fetchDashboards = async (): Promise<Dashboard[]> =>
  database.fetchAll(DASHBOARDS);

export const fetchDashboardById = async (id: string): Promise<Dashboard> =>
  database.fetchById(DASHBOARDS, id);

export const createDashboard = async (dashboard: Dashboard): Promise<Dashboard> =>
  database.create(DASHBOARDS, dashboard);

export const persistDashboard = async (dashboard: Dashboard): Promise<Dashboard> =>
  database.persist(DASHBOARDS, dashboard);

export const deleteDashboard = async (dashboard: Dashboard): Promise<Dashboard> =>
  database.remove(DASHBOARDS, dashboard);

export const fetchDashboardItems = async (): Promise<DashboardItem[]> =>
  database.fetchAll(ITEMS);

export const fetchDashboardItemById = async (id: string): Promise<DashboardItem> =>
  database.fetchById(ITEMS, id);

export const persistDashboardItem = async (item: DashboardItem): Promise<DashboardItem> =>
  database.persist(ITEMS, item);

export const createDashboardItem = async (item: DashboardItem): Promise<DashboardItem> =>
  database.create(ITEMS, item);

export const deleteDashboardItem = async (item: DashboardItem): Promise<DashboardItem> =>
  database.remove(ITEMS, item);
