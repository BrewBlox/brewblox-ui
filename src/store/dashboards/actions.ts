import { getStoreAccessors } from 'vuex-typescript';

import { fetchDashboards } from './api';

import store from '../';
import { DashboardState, DashboardItem, DashboardContext, Dashboard } from './state';
import { State as RootState } from '../state';

import {
  mutateFetching as mutateFetchingInStore,
  addDashboard as addDashboardToStore,
  addDashboardItem as addDashboardItemToStore,
  setDashboardItemOrder as setDashboardItemOrderInStore,
} from './mutations';

const { dispatch } = getStoreAccessors<DashboardState, RootState>('dashboards');

const actions = {
  addDashboard(context: DashboardContext, dashboard: Dashboard) {
    addDashboardToStore(dashboard);
  },
  addDashboardItem(context: DashboardContext, item: DashboardItem) {
    addDashboardItemToStore(item);
  },
  changeDashboardItemOrder(context: DashboardContext, order: string[]) {
    order.forEach((id, index) => setDashboardItemOrderInStore(id, index + 1));
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

export const changeDashboardItemOrder =
  (order: string[]) => dispatch(actions.changeDashboardItemOrder)(store, order);

export default actions;
