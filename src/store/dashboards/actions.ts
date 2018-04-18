import { getStoreAccessors } from 'vuex-typescript';
import UrlSafeString from 'url-safe-string';

import {
  fetchDashboards as fetchDashboardsFromApi,
  fetchDashboardItems as fetchDashboardItemsFromApi,
  persistDashboardItem,
} from './api';

import { DashboardState, DashboardItem, DashboardContext, Dashboard } from './state';
import { State as RootState } from '../state';

import {
  mutateFetching as mutateFetchingInStore,
  addDashboard as addDashboardToStore,
  addDashboardItem as addDashboardItemToStore,
  setDashboardItemOrder as setDashboardItemOrderInStore,
  setDashboardItemSize as setDashboardItemSizeInStore,
} from './mutations';

const { dispatch } = getStoreAccessors<DashboardState, RootState>('dashboards');

const actions = {
  addNewDashboard(context: DashboardContext, title: string) {
    const id = new UrlSafeString().generate(title);

    addDashboardToStore(context, {
      id,
      title,
      order: Object.keys(context.state.dashboards.byId).length + 1,
      items: [],
    });
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
};

// exported action accessors
export const fetchDashboards = dispatch(actions.fetchDashboards);
export const addDashboardItem = dispatch(actions.addDashboardItem);
export const addNewDashboard = dispatch(actions.addNewDashboard);
export const addDashboard = dispatch(actions.addDashboard);
export const updateDashboardItemOrder = dispatch(actions.updateDashboardItemOrder);
export const updateDashboardItemSize = dispatch(actions.updateDashboardItemSize);

export default actions;
