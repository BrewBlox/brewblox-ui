import { getStoreAccessors } from 'vuex-typescript';

import { fetchDashboards as fetchDashboardsFromApi, persistDashboardItem } from './api';

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
  addDashboard(context: DashboardContext, dashboard: Dashboard) {
    addDashboardToStore(context, dashboard);
  },
  addDashboardItem(context: DashboardContext, item: DashboardItem) {
    addDashboardItemToStore(context, item);
  },
  updateDashboardItemOrder(context: DashboardContext, order: string[]) {
    order.forEach((id, index) => {
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
    const { dashboards, items } = await fetchDashboardsFromApi();

    // first add items to store
    items.forEach(item => addDashboardItem(context, item));

    // then add the dashboards
    dashboards.forEach(dashboard => addDashboard(context, dashboard));

    // update isFetching
    mutateFetchingInStore(context, false);
  },
};

// exported action accessors
export const fetchDashboards = dispatch(actions.fetchDashboards);
export const addDashboardItem = dispatch(actions.addDashboardItem);
export const addDashboard = dispatch(actions.addDashboard);
export const updateDashboardItemOrder = dispatch(actions.updateDashboardItemOrder);
export const updateDashboardItemSize = dispatch(actions.updateDashboardItemSize);

export default actions;
