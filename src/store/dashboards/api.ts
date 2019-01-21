import { registerModule, fetchAll, fetchById, create, persist, remove } from '@/helpers/database';
import { Dashboard, DashboardItem } from './state';

const DASHBOARDS = 'dashboards';
const ITEMS = 'dashboard-items';

export const setupDashboards = (
  onChanged: (doc: any) => void,
  onDeleted: (id: string) => void,
) => registerModule({ onChanged, onDeleted, id: DASHBOARDS });

export const setupDashboardItems = (
  onChanged: (doc: any) => void,
  onDeleted: (id: string) => void,
) => registerModule({ onChanged, onDeleted, id: ITEMS });

export const fetchDashboards = async (): Promise<Dashboard[]> =>
  fetchAll(DASHBOARDS);

export const fetchDashboardById = async (id: string): Promise<Dashboard> =>
  fetchById(DASHBOARDS, id);

export const createDashboard = async (dashboard: Dashboard): Promise<Dashboard> =>
  create(DASHBOARDS, dashboard);

export const persistDashboard = async (dashboard: Dashboard): Promise<Dashboard> =>
  persist(DASHBOARDS, dashboard);

export const deleteDashboard = async (dashboard: Dashboard): Promise<Dashboard> =>
  remove(DASHBOARDS, dashboard);

export const fetchDashboardItems = async (): Promise<DashboardItem[]> =>
  fetchAll(ITEMS);

export const fetchDashboardItemById = async (id: string): Promise<DashboardItem> =>
  fetchById(ITEMS, id);

export const persistDashboardItem = async (item: DashboardItem): Promise<DashboardItem> =>
  persist(ITEMS, item);

export const createDashboardItem = async (item: DashboardItem): Promise<DashboardItem> =>
  create(ITEMS, item);

export const deleteDashboardItem = async (item: DashboardItem): Promise<DashboardItem> =>
  remove(ITEMS, item);
