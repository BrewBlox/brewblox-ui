import { getStoreAccessors } from 'vuex-typescript';

import { fetchDashboards, persistDashboardItem } from './api';

import store from '../';
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
    addDashboardToStore(dashboard);
  },
  addDashboardItem(context: DashboardContext, item: DashboardItem) {
    addDashboardItemToStore(item);
  },
  updateDashboardItemOrder(context: DashboardContext, order: string[]) {
    order.forEach((id, index) => {
      setDashboardItemOrderInStore(id, index + 1);

      persistDashboardItem(id, { order: index + 1 });
    });
  },
  updateDashboardItemSize(
    context: DashboardContext,
    { id, cols, rows }: { id: string, cols: number, rows: number },
  ) {
    setDashboardItemSizeInStore(id, cols, rows);

    // @TODO communicate change to API
  },
  async listDashboards() {
    // update isFetching
    mutateFetchingInStore(true);

    // will fetch blocks from the server
    const { dashboards, items } = await fetchDashboards();

    // first add items to store
    items.forEach(item => addDashboardItem(item));

    // then add the dashboards
    dashboards.forEach(dashboard => addDashboard(dashboard));

    // update isFetching
    mutateFetchingInStore(false);
  },
};

// exported action accessors
export const listDashboards =
  () => dispatch(actions.listDashboards)(store);

export const addDashboardItem =
  (item: DashboardItem) => dispatch(actions.addDashboardItem)(store, item);

export const addDashboard =
  (dashboard: Dashboard) => dispatch(actions.addDashboard)(store, dashboard);

export const updateDashboardItemOrder =
  (order: string[]) => dispatch(actions.updateDashboardItemOrder)(store, order);

export const updateDashboardItemSize =
  (id: string, cols: number, rows: number) =>
    dispatch(actions.updateDashboardItemSize)(store, { id, cols, rows });

export default actions;
