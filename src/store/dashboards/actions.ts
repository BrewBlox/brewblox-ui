import { getStoreAccessors } from 'vuex-typescript';
import UrlSafeString from 'url-safe-string';

import {
  fetchDashboards as fetchDashboardsFromApi,
  fetchDashboardItems as fetchDashboardItemsFromApi,
  createDashboard as createDashboardOnApi,
  persistDashboard,
  persistDashboardItem,
  createDashboardItem as createDashboardItemOnApi,
} from './api';

import { DashboardState, DashboardItem, DashboardContext, Dashboard } from './state';
import { State as RootState } from '../state';

import {
  mutateFetching as mutateFetchingInStore,
  addDashboard as addDashboardToStore,
  setDashboard as setDashboardInStore,
  setDashboardOrder as setDashboardOrderInStore,
  addDashboardItem as addDashboardItemToStore,
  setDashboardItemOrder as setDashboardItemOrderInStore,
  setDashboardItemSize as setDashboardItemSizeInStore,
} from './mutations';

const { dispatch } = getStoreAccessors<DashboardState, RootState>('dashboards');

const actions = {
  addNewDashboard(context: DashboardContext, title: string) {
    const id = new UrlSafeString().generate(title);

    const dashboard = {
      id,
      title,
      order: Object.keys(context.state.dashboards.byId).length + 1,
      items: [],
    };

    // add dashboard to store
    addDashboardToStore(context, dashboard);

    // add dashboard to API
    createDashboardOnApi(dashboard);
  },
  updateDashboardOrder(context: DashboardContext, orders: string[]) {
    orders.forEach((id, index) => {
      const order = index + 1;
      setDashboardOrderInStore(context, { id, order });

      persistDashboard(id, { order });
    });
  },
  updateDashboard(context: DashboardContext, dashboard: Dashboard) {
    setDashboardInStore(context, dashboard);

    persistDashboard(dashboard.id, dashboard);
  },
  addDashboard(context: DashboardContext, dashboard: Dashboard) {
    addDashboardToStore(context, dashboard);
  },
  addDashboardItem(context: DashboardContext, item: DashboardItem) {
    addDashboardItemToStore(context, item);
  },
  updateDashboardItemOrder(context: DashboardContext, orders: string[]) {
    orders.forEach((id, index) => {
      const order = index + 1;
      setDashboardItemOrderInStore(context, { id, order });

      persistDashboardItem(id, { order });
    });
  },
  updateDashboardItemSize(
    context: DashboardContext,
    { id, cols, rows }: { id: string, cols: number, rows: number },
  ) {
    setDashboardItemSizeInStore(context, { id, cols, rows });

    persistDashboardItem(id, { cols, rows });
  },
  async fetchDashboards(context: DashboardContext) {
    // update isFetching
    mutateFetchingInStore(context, true);

    // will fetch blocks from the server
    const [dashboards, items] = await Promise.all([
      fetchDashboardsFromApi(),
      fetchDashboardItemsFromApi(),
    ]);

    // first add items to store
    items.forEach(item => actions.addDashboardItem(context, item));

    // then add the dashboards
    dashboards.forEach(dashboard => actions.addDashboard(context, dashboard));

    // update isFetching
    mutateFetchingInStore(context, false);
  },
  async createDashboardItem(context: DashboardContext, data: any): Promise<DashboardItem> {
    // create dashboard item on api
    const dashboardItem = await createDashboardItemOnApi(data);

    // add to store
    actions.addDashboardItem(context, dashboardItem);

    return dashboardItem;
  },
  addDashboardItemToDashboard(
    context: DashboardContext,
    payload: { dashboard: Dashboard, dashboardItem: DashboardItem },
  ) {
    const { dashboard, dashboardItem } = payload;

    actions.updateDashboard(context, {
      ...dashboard,
      items: [...dashboard.items, dashboardItem.id],
    });
  },
};

// exported action accessors
export const fetchDashboards = dispatch(actions.fetchDashboards);
export const addDashboardItem = dispatch(actions.addDashboardItem);
export const addNewDashboard = dispatch(actions.addNewDashboard);
export const updateDashboardOrder = dispatch(actions.updateDashboardOrder);
export const updateDashboard = dispatch(actions.updateDashboard);
export const addDashboard = dispatch(actions.addDashboard);
export const addDashboardItemToDashboard = dispatch(actions.addDashboardItemToDashboard);
export const updateDashboardItemOrder = dispatch(actions.updateDashboardItemOrder);
export const updateDashboardItemSize = dispatch(actions.updateDashboardItemSize);
export const createDashboardItem = dispatch(actions.createDashboardItem);

export default actions;
