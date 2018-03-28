import { getStoreAccessors } from 'vuex-typescript';

import { fetchDashboards } from './api';

import store from '../';
import { DashboardState, DashboardItem, DashboardContext, Dashboard } from './state';
import { State as RootState } from '../state';

import {
  mutateFetching as mutateFetchingInStore,
  addDashboard as addDashboardToStore,
  addDashboardItem as addDashboardItemToStore,
} from './mutations';

const { dispatch } = getStoreAccessors<DashboardState, RootState>('dashboards');

const actions = {
  addDashboard(context: DashboardContext, dashboard: Dashboard) {
    addDashboardToStore(dashboard);
  },
  addDashboardItem(context: DashboardContext, item: DashboardItem) {
    addDashboardItemToStore(item);
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

export default actions;
