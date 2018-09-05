import Vue from 'vue';
import { getStoreAccessors } from 'vuex-typescript';

import { Dashboard, DashboardItem, DashboardState } from './state';

import { State as RootState } from '../state';

const { commit } = getStoreAccessors<DashboardState, RootState>('dashboards');

function updateDashboard(state: DashboardState, id: string, newData: any) {
  Vue.set(state.dashboards, id, { ...state.dashboards[id], ...newData });
}

function updateDashboardItem(state: DashboardState, id: string, newData: any) {
  Vue.set(state.items, id, { ...state.items[id], ...newData });
}

const mutations = {
  addDashboard(state: DashboardState, dashboard: Dashboard) {
    Vue.set(state.dashboards, dashboard.id, { ...dashboard });
  },

  setDashboardOrder(state: DashboardState, { id, order }: { id: string, order: number }) {
    updateDashboard(state, id, { order });
  },

  setDashboard(state: DashboardState, dashboard: Dashboard) {
    updateDashboard(state, dashboard.id, dashboard);
  },

  addDashboardItem(state: DashboardState, item: DashboardItem) {
    Vue.set(state.items, item.id, { ...item });
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

  setDashboardItemConfig(
    state: DashboardState,
    { id, config }: { id: string, config: any },
  ) {
    updateDashboardItem(state, id, { config: { ...config } });
  },

};

// exported commit accessors
export const mutateFetching = commit(mutations.mutateFetching);
export const addDashboard = commit(mutations.addDashboard);
export const setDashboard = commit(mutations.setDashboard);
export const setDashboardOrder = commit(mutations.setDashboardOrder);
export const addDashboardItem = commit(mutations.addDashboardItem);
export const setDashboardItemOrder = commit(mutations.setDashboardItemOrder);
export const setDashboardItemSize = commit(mutations.setDashboardItemSize);
export const setDashboardItemConfig = commit(mutations.setDashboardItemConfig);

export default mutations;
