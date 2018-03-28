import { getStoreAccessors } from 'vuex-typescript';

import { Dashboard, DashboardItem, DashboardState } from './state';
import { State as RootState } from '../state';
import store from '../index';

const { commit } = getStoreAccessors<DashboardState, RootState>('dashboards');

const mutations = {
  addDashboard(state: DashboardState, dashboard: Dashboard) {
    state.dashboards.allIds.push(dashboard.id);
    state.dashboards.byId[dashboard.id] = { ...dashboard };
  },
  addDashboardItem(state: DashboardState, item: DashboardItem) {
    state.items.allIds.push(item.id);
    state.items.byId[item.id] = { ...item };
  },
  mutateFetching(state: DashboardState, fetching: boolean) {
    state.fetching = fetching;
  },
};

// exported commit accessors
export const mutateFetching =
  (fetching: boolean) => commit(mutations.mutateFetching)(store, fetching);

export const addDashboard =
  (dashboard: Dashboard) => commit(mutations.addDashboard)(store, dashboard);

export const addDashboardItem =
  (item: DashboardItem) => commit(mutations.addDashboardItem)(store, item);

export default mutations;
