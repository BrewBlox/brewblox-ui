import { getStoreAccessors } from 'vuex-typescript';

import store from '../';
import { Dashboard, DashboardItem, DashboardState } from './state';
import { State as RootState } from '../state';

const { read } = getStoreAccessors<DashboardState, RootState>('dashboards');

const getters = {
  dashboardsById: (state: DashboardState): { [id: string]: Dashboard } => state.dashboards.byId,
  dashboardIds(state: DashboardState): string[] {
    return state.dashboards.allIds;
  },
  allDashboards(state: DashboardState): Dashboard[] {
    return state.dashboards.allIds.map(id => state.dashboards.byId[id]);
  },
  dashboardItemsById: (state: DashboardState): { [id: string]: DashboardItem } => state.items.byId,
  dashboardItemIds(state: DashboardState): string[] {
    return state.items.allIds;
  },
  allDashboardItems(state: DashboardState): DashboardItem[] {
    return state.items.allIds.map(id => state.items.byId[id]);
  },
  isFetching(state: DashboardState): boolean {
    return state.fetching;
  },
};

// exported getter accessors
export const allDashboards =
  () => read(getters.allDashboards)(store);

export const dashboardIds =
  () => read(getters.dashboardIds)(store);

const dashboardsById =
  () => read(getters.dashboardsById)(store);

export const dashboardById =
  (id: string): Dashboard => dashboardsById()[id];

export const allDashboardItems =
  () => read(getters.allDashboardItems)(store);

export const dashboardItemIds =
  () => read(getters.dashboardItemIds)(store);

const dashboardItemsById =
  () => read(getters.dashboardItemsById)(store);

export const dashboardItemById =
  (id: string): DashboardItem => dashboardItemsById()[id];

export const isFetching =
  () => read(getters.isFetching)(store);

export default getters;
