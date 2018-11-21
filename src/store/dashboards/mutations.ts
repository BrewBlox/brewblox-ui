import Vue from 'vue';
import { addVuexKey } from '@/store/vuex-key-fix';
import { getStoreAccessors } from 'vuex-typescript';
import { Dashboard, DashboardItem, DashboardState } from './state';
import { RootState } from '../state';

const { commit } = getStoreAccessors<DashboardState, RootState>('dashboards');

const mutations = {
  setDashboard: (state: DashboardState, dashboard: Dashboard) =>
    Vue.set(state.dashboards, dashboard.id, { ...dashboard }),

  setAllDashboards: (state: DashboardState, dashboards: Dashboard[]) =>
    Vue.set(state, 'dashboards', dashboards.reduce((acc, db) => ({ ...acc, [db.id]: db }), {})),

  removeDashboard: (state: DashboardState, dashboard: Dashboard) =>
    Vue.delete(state.dashboards, dashboard.id),

  setDashboardItem: (state: DashboardState, item: DashboardItem) =>
    Vue.set(state.items, item.id, { ...item }),

  setAllDashboardItems: (state: DashboardState, items: DashboardItem[]) =>
    Vue.set(state, 'items', items.reduce((acc, item) => ({ ...acc, [item.id]: item }), {})),

  removeDashboardItem: (state: DashboardState, item: DashboardItem) =>
    Vue.delete(state.items, item.id),
};

addVuexKey(mutations);
export default mutations;

export const setDashboard = commit(mutations.setDashboard);
export const setAllDashboards = commit(mutations.setAllDashboards);
export const removeDashboard = commit(mutations.removeDashboard);

export const setDashboardItem = commit(mutations.setDashboardItem);
export const setAllDashboardItems = commit(mutations.setAllDashboardItems);
export const removeDashboardItem = commit(mutations.removeDashboardItem);
