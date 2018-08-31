import { map } from 'lodash';

import { getStoreAccessors } from 'vuex-typescript';

import { Dashboard, DashboardItem, DashboardState, DashboardContext } from './state';
import { State as RootState, RootStore } from '../state';

const { read } = getStoreAccessors<DashboardState, RootState>('dashboards');

const getters = {
  dashboardsById: (state: DashboardState): { [id: string]: Dashboard } => state.dashboards,

  dashboardIds(state: DashboardState): string[] {
    return map(state.dashboards, (_: Dashboard, key: string) => key);
  },

  allDashboards(state: DashboardState): Dashboard[] {
    return map(state.dashboards, (dash: Dashboard) => dash);
  },

  dashboardItemsById: (state: DashboardState): { [id: string]: DashboardItem } => state.items,

  dashboardItemIds(state: DashboardState): string[] {
    return map(state.items, (_: DashboardItem, key: string) => key);
  },

  allDashboardItems(state: DashboardState): DashboardItem[] {
    return map(state.items, (item: DashboardItem) => item);
  },

  isFetching(state: DashboardState): boolean {
    return state.fetching;
  },

};

// exported getter accessors
export const allDashboards = read(getters.allDashboards);
export const dashboardIds = read(getters.dashboardIds);
const dashboardsById = read(getters.dashboardsById);
export const allDashboardItems = read(getters.allDashboardItems);
export const dashboardItemIds = read(getters.dashboardItemIds);
const dashboardItemsById = read(getters.dashboardItemsById);

export const dashboardById =
  (store: RootStore | DashboardContext, id: string): Dashboard => dashboardsById(store)[id];
export const dashboardItemById =
  (store: RootStore | DashboardContext, id: string): DashboardItem => dashboardItemsById(store)[id];

export const isFetching = read(getters.isFetching);

export default getters;
