import { getStoreAccessors } from 'vuex-typescript';
import UrlSafeString from 'url-safe-string';

import {
  fetchDashboards as fetchDashboardsFromApi,
  fetchDashboardItems as fetchDashboardItemsFromApi,
  createDashboard as createDashboardOnApi,
  persistDashboard,
  deleteDashboard as removeDashboardOnApi,
  persistDashboardItem,
  createDashboardItem as createDashboardItemOnApi,
  deleteDashboardItem as removeDashboardItemOnApi,
} from './api';

import { DashboardState, DashboardItem, DashboardContext, Dashboard } from './state';
import { RootState } from '../state';

import {
  dashboardItemById as getDashboardItemInStore,
  dashboardById as getDashboardInStore,
} from './getters';
import {
  mutateFetching as mutateFetchingInStore,
  addDashboard as addDashboardToStore,
  setDashboard as setDashboardInStore,
  removeDashboard as removeDashboardInStore,
  setDashboardOrder as setDashboardOrderInStore,
  addDashboardItem as addDashboardItemToStore,
  setDashboardItemOrder as setDashboardItemOrderInStore,
  setDashboardItemSize as setDashboardItemSizeInStore,
  setDashboardItemConfig as setDashboardItemConfigInStore,
  removeDashboardItem as removeDashboardItemInStore,
} from './mutations';

const { dispatch } = getStoreAccessors<DashboardState, RootState>('dashboards');

const actions = {
  addNewDashboard(context: DashboardContext, title: string) {
    const id = new UrlSafeString().generate(title);
    const dashboard = {
      id,
      title,
      order: Object.keys(context.state.dashboards).length + 1,
      items: [],
    };
    addDashboardToStore(context, dashboard);
    createDashboardOnApi(dashboard);
  },

  updateDashboardOrder(context: DashboardContext, orders: string[]) {
    orders.forEach((id, index) => {
      const order = index + 1;
      setDashboardOrderInStore(context, { id, order });
      persistDashboard(getDashboardInStore(context, id));
    });
  },

  updateDashboard(context: DashboardContext, dashboard: Dashboard) {
    setDashboardInStore(context, dashboard);
    persistDashboard(dashboard);
  },

  addDashboard(context: DashboardContext, dashboard: Dashboard) {
    addDashboardToStore(context, dashboard);
  },

  async removeDashboard(context: DashboardContext, dashboard: Dashboard) {
    Promise.all(getDashboardInStore(context, dashboard.id)
      .items
      .map(itemId =>
        actions.removeDashboardItem(context, getDashboardItemInStore(context, itemId))));
    removeDashboardInStore(context, dashboard);
    removeDashboardOnApi(dashboard);
  },

  addDashboardItem(context: DashboardContext, item: DashboardItem) {
    addDashboardItemToStore(context, item);
  },

  updateDashboardItemOrder(context: DashboardContext, itemIds: string[]) {
    itemIds.forEach((id, index) => {
      const order = index + 1;
      setDashboardItemOrderInStore(context, { id, order });
      persistDashboardItem(getDashboardItemInStore(context, id));
    });
  },

  updateDashboardItemSize(
    context: DashboardContext,
    { id, cols, rows }: { id: string, cols: number, rows: number },
  ) {
    setDashboardItemSizeInStore(context, { id, cols, rows });
    persistDashboardItem(getDashboardItemInStore(context, id));
  },

  updateDashboardItemConfig(
    context: DashboardContext,
    { id, config }: { id: string, config: any },
  ) {
    setDashboardItemConfigInStore(context, { id, config });
    persistDashboardItem(getDashboardItemInStore(context, id));
  },

  async fetchDashboards(context: DashboardContext) {
    mutateFetchingInStore(context, true);
    const [dashboards, items] = await Promise.all([
      fetchDashboardsFromApi(),
      fetchDashboardItemsFromApi(),
    ]);
    items.forEach(item => actions.addDashboardItem(context, item));
    dashboards.forEach(dashboard => actions.addDashboard(context, dashboard));
    mutateFetchingInStore(context, false);
  },

  async createDashboardItem(
    context: DashboardContext,
    payload: { dashboard: Dashboard, item: DashboardItem },
  ) {
    const { dashboard, item } = payload;
    const dashboardItem = await createDashboardItemOnApi(item);
    actions.addDashboardItem(context, dashboardItem);
    actions.addDashboardItemToDashboard(context, { dashboard, item });
  },

  addDashboardItemToDashboard(
    context: DashboardContext,
    payload: { dashboard: Dashboard, item: DashboardItem },
  ) {
    const { dashboard, item } = payload;

    actions.updateDashboard(context, {
      ...dashboard,
      items: [...dashboard.items, item.id],
    });
  },

  removeDashboardItem(context: DashboardContext, item: DashboardItem) {
    removeDashboardItemOnApi(item);
    removeDashboardItemInStore(context, item);
  },
};

export const fetchDashboards = dispatch(actions.fetchDashboards);
export const addDashboardItem = dispatch(actions.addDashboardItem);
export const addNewDashboard = dispatch(actions.addNewDashboard);
export const updateDashboardOrder = dispatch(actions.updateDashboardOrder);
export const updateDashboard = dispatch(actions.updateDashboard);
export const addDashboard = dispatch(actions.addDashboard);
export const removeDashboard = dispatch(actions.removeDashboard);
export const addDashboardItemToDashboard = dispatch(actions.addDashboardItemToDashboard);
export const updateDashboardItemOrder = dispatch(actions.updateDashboardItemOrder);
export const updateDashboardItemSize = dispatch(actions.updateDashboardItemSize);
export const updateDashboardItemConfig = dispatch(actions.updateDashboardItemConfig);
export const createDashboardItem = dispatch(actions.createDashboardItem);
export const removeDashboardItem = dispatch(actions.removeDashboardItem);

export default actions;
