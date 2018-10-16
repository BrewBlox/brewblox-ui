import { getStoreAccessors } from 'vuex-typescript';
import UrlSafeString from 'url-safe-string';

import {
  fetchDashboards as fetchDashboardsInApi,
  fetchDashboardItems as fetchDashboardItemsInApi,
  createDashboard as createDashboardInApi,
  persistDashboard as persistDashboardInApi,
  deleteDashboard as removeDashboardInApi,
  persistDashboardItem,
  createDashboardItem as createDashboardItemInApi,
  deleteDashboardItem as removeDashboardItemInApi,
} from './api';

import { DashboardState, DashboardItem, DashboardContext, Dashboard } from './state';
import { RootState } from '../state';

import {
  dashboardItemById as getDashboardItemInStore,
  dashboardById as getDashboardInStore,
  dashboardIds as getDashboardIds,
} from './getters';
import {
  mutateFetching as mutateFetchingInStore,
  addDashboard as addDashboardInStore,
  setDashboard as setDashboardInStore,
  removeDashboard as removeDashboardInStore,
  addDashboardItem as addDashboardItemInStore,
  setDashboardItemOrder as setDashboardItemOrderInStore,
  setDashboardItemSize as setDashboardItemSizeInStore,
  setDashboardItemConfig as setDashboardItemConfigInStore,
  removeDashboardItem as removeDashboardItemInStore,
} from './mutations';

const { dispatch } = getStoreAccessors<DashboardState, RootState>('dashboards');

const update = async (context: DashboardContext, dashboard: Dashboard) => {
  setDashboardInStore(context, dashboard);
  await persistDashboardInApi(dashboard);
};

const actions = {
  addNewDashboard(context: DashboardContext, title: string) {
    const id = new UrlSafeString().generate(title);
    const dashboard = {
      id,
      title,
      order: Object.keys(context.state.dashboards).length + 1,
      items: [],
    };
    addDashboardInStore(context, dashboard);
    createDashboardInApi(dashboard);
  },

  updateDashboardOrder(context: DashboardContext, orders: string[]) {
    orders.forEach((id, index) => {
      const order = index + 1;
      update(context, { ...getDashboardInStore(context, id), order });
    });
  },

  addDashboard(context: DashboardContext, dashboard: Dashboard) {
    addDashboardInStore(context, dashboard);
  },

  updateDashboard(context: DashboardContext, dashboard: Dashboard) {
    update(context, dashboard);
  },

  async removeDashboard(context: DashboardContext, dashboard: Dashboard) {
    Promise.all(getDashboardInStore(context, dashboard.id)
      .items
      .map(itemId =>
        actions.removeDashboardItem(context, getDashboardItemInStore(context, itemId))));
    removeDashboardInStore(context, dashboard);
    removeDashboardInApi(dashboard);
  },

  addDashboardItem(context: DashboardContext, item: DashboardItem) {
    addDashboardItemInStore(context, item);
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
      fetchDashboardsInApi(),
      fetchDashboardItemsInApi(),
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
    const dashboardItem = await createDashboardItemInApi(item);
    actions.addDashboardItem(context, dashboardItem);
    actions.addDashboardItemToDashboard(context, { dashboard, item });
  },

  addDashboardItemToDashboard(
    context: DashboardContext,
    payload: { dashboard: Dashboard, item: DashboardItem },
  ) {
    const { dashboard, item } = payload;

    update(context, {
      ...dashboard,
      items: [...dashboard.items, item.id],
    });
  },

  removeDashboardItem(context: DashboardContext, item: DashboardItem) {
    removeDashboardItemInApi(item);
    removeDashboardItemInStore(context, item);
  },

  updatePrimaryDashboard(context: DashboardContext, newId: string | null) {
    getDashboardIds(context)
      .forEach((id: string) => {
        const dash = getDashboardInStore(context, id);
        if (dash.id === newId) {
          update(context, { ...dash, primary: true });
        } else if (dash.primary) {
          update(context, { ...dash, primary: false });
        }
      });
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
export const updatePrimaryDashboard = dispatch(actions.updatePrimaryDashboard);

export default actions;
