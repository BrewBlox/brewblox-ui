import { createAccessors } from '@/helpers/static-store';
import UrlSafeString from 'url-safe-string';
import {
  createDashboard as createDashboardInApi,
  createDashboardItem as createDashboardItemInApi,
  deleteDashboard as removeDashboardInApi,
  deleteDashboardItem as removeDashboardItemInApi,
  fetchDashboardItems as fetchDashboardItemsInApi,
  fetchDashboards as fetchDashboardsInApi,
  persistDashboard as persistDashboardInApi,
  persistDashboardItem,
} from './api';
import {
  allDashboards as getAllDashboards,
  dashboardById as getDashboardInStore,
  dashboardItemById as getDashboardItemInStore,
  dashboardItemsByDashboardId,
} from './getters';
import {
  removeDashboard as removeDashboardInStore,
  removeDashboardItem as removeDashboardItemInStore,
  setAllDashboardItems as setAllDashboardItemsInStore,
  setAllDashboards as setAllDashboardsInStore,
  setDashboard as setDashboardInStore,
  setDashboardItem as setDashboardItemInStore,
} from './mutations';
import { Dashboard, DashboardContext, DashboardItem } from './state';

const { dispatch } = createAccessors('dashboards');

export const actions = {
  createDashboard: async (context: DashboardContext, title: string) => {
    const id = new UrlSafeString().generate(title);
    const dashboard = {
      id,
      title,
      order: Object.keys(context.state.dashboards).length + 1,
    };
    setDashboardInStore(context, dashboard);
    createDashboardInApi(dashboard);
  },

  saveDashboard: async (context: DashboardContext, dashboard: Dashboard) =>
    setDashboardInStore(context, await persistDashboardInApi(dashboard)),

  updateDashboardOrder: async (context: DashboardContext, ids: string[]) =>
    ids.forEach((id, index) =>
      actions.saveDashboard(context, { ...getDashboardInStore(context, id), order: index + 1 })),

  updatePrimaryDashboard: async (context: DashboardContext, newId: string | null) => {
    getAllDashboards(context)
      .forEach((dash: Dashboard) => {
        if (dash.id === newId) {
          actions.saveDashboard(context, { ...dash, primary: true });
        } else if (dash.primary) {
          actions.saveDashboard(context, { ...dash, primary: false });
        }
      });
  },

  removeDashboard: async (context: DashboardContext, dashboard: Dashboard) => {
    dashboardItemsByDashboardId(context, dashboard.id)
      .forEach((item: DashboardItem) => actions.removeDashboardItem(context, item));
    removeDashboardInApi(dashboard).catch(() => { });
    removeDashboardInStore(context, dashboard);
  },

  createDashboardItem: async (context: DashboardContext, item: DashboardItem) =>
    setDashboardItemInStore(context, await createDashboardItemInApi(item)),

  saveDashboardItem: async (context: DashboardContext, item: DashboardItem) =>
    setDashboardItemInStore(context, await persistDashboardItem(item)),

  updateDashboardItemId: async (
    context: DashboardContext,
    { id, newId }: { id: string, newId: string },
  ) => {
    const item = getDashboardItemInStore(context, id);
    const currentItemNewId = getDashboardItemInStore(context, newId);
    if (!item) {
      throw new Error(`Unable to rename ${id}: item does not exist`);
    }
    if (currentItemNewId) {
      throw new Error(`An item with ID ${newId} already exists`);
    }
    actions.removeDashboardItem(context, { ...item });
    actions.createDashboardItem(context, { ...item, id: newId });
  },

  updateDashboardItemOrder: async (context: DashboardContext, itemIds: string[]) =>
    itemIds.forEach((id, index) => {
      const item = getDashboardItemInStore(context, id);
      const order = index + 1;
      if (item.order !== order) {
        actions.saveDashboardItem(context, { ...item, order });
      }
    }),

  updateDashboardItemSize: async (
    context: DashboardContext,
    { id, cols, rows }: { id: string, cols: number, rows: number },
  ) => {
    const item = getDashboardItemInStore(context, id);
    actions.saveDashboardItem(context, { ...item, cols, rows });
  },

  updateDashboardItemConfig: async (
    context: DashboardContext,
    { id, config }: { id: string, config: any },
  ) => {
    const item = getDashboardItemInStore(context, id);
    actions.saveDashboardItem(context, { ...item, config });
  },

  removeDashboardItem: async (context: DashboardContext, item: DashboardItem) => {
    removeDashboardItemInApi(item).catch(() => { });
    removeDashboardItemInStore(context, item);
  },

  fetchAll: async (context: DashboardContext) => {
    setAllDashboardsInStore(context, await fetchDashboardsInApi());
    setAllDashboardItemsInStore(context, await fetchDashboardItemsInApi());
  },
};

export const createDashboard = dispatch(actions.createDashboard);
export const saveDashboard = dispatch(actions.saveDashboard);
export const updateDashboardOrder = dispatch(actions.updateDashboardOrder);
export const updatePrimaryDashboard = dispatch(actions.updatePrimaryDashboard);
export const removeDashboard = dispatch(actions.removeDashboard);

export const createDashboardItem = dispatch(actions.createDashboardItem);
export const saveDashboardItem = dispatch(actions.saveDashboardItem);
export const updateDashboardItemId = dispatch(actions.updateDashboardItemId);
export const updateDashboardItemOrder = dispatch(actions.updateDashboardItemOrder);
export const updateDashboardItemSize = dispatch(actions.updateDashboardItemSize);
export const updateDashboardItemConfig = dispatch(actions.updateDashboardItemConfig);
export const removeDashboardItem = dispatch(actions.removeDashboardItem);

export const fetchAll = dispatch(actions.fetchAll);
