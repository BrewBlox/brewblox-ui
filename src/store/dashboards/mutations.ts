import Vue from 'vue';
import { getStoreAccessors } from 'vuex-typescript';
import { Dashboard, DashboardItem, DashboardState } from './state';
import { RootState } from '../state';
import { stat } from 'fs';

const { commit } = getStoreAccessors<DashboardState, RootState>('dashboards');

const updateDashboard = (state: DashboardState, id: string, newData: any) =>
  Vue.set(state.dashboards, id, { ...state.dashboards[id], ...newData });

const updateDashboardItem = (state: DashboardState, id: string, newData: any) =>
  Vue.set(state.items, id, { ...state.items[id], ...newData });

const mutations = {
  addDashboard: (state: DashboardState, dashboard: Dashboard) =>
    Vue.set(state.dashboards, dashboard.id, { ...dashboard }),

  setDashboards: (state: DashboardState, dashboards: Dashboard[]) =>
    Vue.set(state, 'dashboards', dashboards.reduce((acc, db) => ({ ...acc, [db.id]: db }), {})),

  setDashboard: (state: DashboardState, dashboard: Dashboard) =>
    updateDashboard(state, dashboard.id, dashboard),

  removeDashboard: (state: DashboardState, dashboard: Dashboard) =>
    Vue.delete(state.dashboards, dashboard.id),

  addDashboardItem: (state: DashboardState, item: DashboardItem) =>
    Vue.set(state.items, item.id, { ...item }),

  setDashboardItems: (state: DashboardState, items: DashboardItem[]) =>
    Vue.set(state, 'items', items.reduce((acc, item) => ({ ...acc, [item.id]: item }), {})),

  setDashboardItemOrder: (state: DashboardState, { id, order }: { id: string, order: number }) =>
    updateDashboardItem(state, id, { order }),

  setDashboardItemSize: (
    state: DashboardState,
    { id, cols, rows }: { id: string, cols: number, rows: number },
  ) =>
    updateDashboardItem(state, id, { cols, rows }),

  setDashboardItemConfig: (state: DashboardState, { id, config }: { id: string, config: any }) =>
    updateDashboardItem(state, id, { config }),

  removeDashboardItem: (state: DashboardState, item: DashboardItem) =>
    Vue.delete(state.items, item.id),
};

export default mutations;

export const addDashboard = commit(mutations.addDashboard);
export const setDashboard = commit(mutations.setDashboard);
export const removeDashboard = commit(mutations.removeDashboard);
export const addDashboardItem = commit(mutations.addDashboardItem);
export const setDashboardItemOrder = commit(mutations.setDashboardItemOrder);
export const setDashboardItemSize = commit(mutations.setDashboardItemSize);
export const setDashboardItemConfig = commit(mutations.setDashboardItemConfig);
export const removeDashboardItem = commit(mutations.removeDashboardItem);
