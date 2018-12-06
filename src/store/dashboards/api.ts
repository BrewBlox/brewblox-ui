import { createDatabase, fromDocument, toDocument } from '@/helpers/database';
import { Dashboard, DashboardItem } from './state';

const dashboardDB = createDatabase('dashboards');
const itemDB = createDatabase('dashboard-items');

export const fetchDashboards = async (): Promise<Dashboard[]> =>
  dashboardDB.allDocs({ include_docs: true })
    .then(resp =>
      resp.rows
        .map(row => fromDocument(row.doc) as Dashboard));

export const fetchDashboardById = async (id: string): Promise<Dashboard> =>
  dashboardDB.get(id)
    .then(fromDocument);

export const createDashboard = async (dashboard: Dashboard): Promise<Dashboard> =>
  dashboardDB.put(toDocument(dashboard))
    .then(resp => ({ ...dashboard, _rev: resp.rev }));

export const persistDashboard = async (dashboard: Dashboard): Promise<Dashboard> =>
  dashboardDB.put(toDocument(dashboard))
    .then(resp => ({ ...dashboard, _rev: resp.rev }));

export const deleteDashboard = async (dashboard: Dashboard): Promise<Dashboard> =>
  dashboardDB.remove(toDocument(dashboard))
    .then(() => dashboard);

export const fetchDashboardItems = async (): Promise<DashboardItem[]> =>
  itemDB.allDocs({ include_docs: true })
    .then(resp =>
      resp.rows
        .map(row => fromDocument(row.doc) as DashboardItem));

export const fetchDashboardItemById = async (id: string): Promise<DashboardItem> =>
  itemDB.get(id)
    .then(fromDocument);

export const persistDashboardItem = async (item: DashboardItem): Promise<DashboardItem> =>
  itemDB.put(toDocument(item))
    .then(resp => ({ ...item, _rev: resp.rev }));

export const createDashboardItem = async (item: DashboardItem): Promise<DashboardItem> =>
  itemDB.put(toDocument(item))
    .then(resp => ({ ...item, _rev: resp.rev }));

export const deleteDashboardItem = async (item: DashboardItem): Promise<DashboardItem> =>
  itemDB.remove(toDocument(item))
    .then(() => item);
