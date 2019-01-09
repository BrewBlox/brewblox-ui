import { createAccessors } from '@/helpers/static-store';
import Vue from 'vue';
import { MutationTree } from 'vuex';
import { Dashboard, DashboardItem, DashboardState } from './state';

const { commit } = createAccessors('dashboards');

export const mutations: MutationTree<DashboardState> = {
  setDashboard: (state: DashboardState, dashboard: Dashboard) =>
    Vue.set(state.dashboards, dashboard.id, { ...dashboard }),

  setAllDashboards: (state: DashboardState, dashboards: Dashboard[]) =>
    Vue.set(state, 'dashboards', dashboards.reduce((acc, db) => ({ ...acc, [db.id]: db }), {})),

  removeDashboard: (state: DashboardState, dashboard: Dashboard) =>
    Vue.delete(state.dashboards, dashboard.id),

  setReplicatingDashboards: (state: DashboardState, val: boolean) =>
    Vue.set(state, 'replicatingDashboards', val),

  setDashboardItem: (state: DashboardState, item: DashboardItem) =>
    Vue.set(state.items, item.id, { ...item }),

  setAllDashboardItems: (state: DashboardState, items: DashboardItem[]) =>
    Vue.set(state, 'items', items.reduce((acc, item) => ({ ...acc, [item.id]: item }), {})),

  removeDashboardItem: (state: DashboardState, item: DashboardItem) =>
    Vue.delete(state.items, item.id),

  setReplicatingItems: (state: DashboardState, val: boolean) =>
    Vue.set(state, 'replicatingItems', val),
};

export const setDashboard = commit(mutations.setDashboard);
export const setAllDashboards = commit(mutations.setAllDashboards);
export const removeDashboard = commit(mutations.removeDashboard);
export const setReplicatingDashboards = commit(mutations.setReplicatingDashboards);

export const setDashboardItem = commit(mutations.setDashboardItem);
export const setAllDashboardItems = commit(mutations.setAllDashboardItems);
export const removeDashboardItem = commit(mutations.removeDashboardItem);
export const setReplicatingItems = commit(mutations.setReplicatingItems);
