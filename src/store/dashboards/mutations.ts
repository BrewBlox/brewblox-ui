import Vue from 'vue';
import { getStoreAccessors } from 'vuex-typescript';
import { merge } from 'lodash';

import { Dashboard, DashboardItem, DashboardState } from './state';
import { State as RootState } from '../state';
import store from '../index';

const { commit } = getStoreAccessors<DashboardState, RootState>('dashboards');

function updateDashboardItem(state: DashboardState, id: string, newData: any) {
  Vue.set(state.items, 'byId', Object.assign(
    {},
    state.items.byId,
    { [id]: merge(state.items.byId[id], newData) },
  ));
}

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
  setDashboardItemOrder(state: DashboardState, { id, order }: { id: string, order: number }) {
    updateDashboardItem(state, id, { order });
  },
  setDashboardItemSize(
    state: DashboardState,
    { id, cols, rows }: { id: string, cols: number, rows: number },
  ) {
    updateDashboardItem(state, id, { cols, rows });
  },
};

// exported commit accessors
export const mutateFetching =
  (fetching: boolean) => commit(mutations.mutateFetching)(store, fetching);

export const addDashboard =
  (dashboard: Dashboard) => commit(mutations.addDashboard)(store, dashboard);

export const addDashboardItem =
  (item: DashboardItem) => commit(mutations.addDashboardItem)(store, item);

export const setDashboardItemOrder =
  (id: string, order: number) => commit(mutations.setDashboardItemOrder)(store, { id, order });

export const setDashboardItemSize =
  (id: string, cols: number, rows: number) =>
    commit(mutations.setDashboardItemSize)(store, { id, cols, rows });

export default mutations;
