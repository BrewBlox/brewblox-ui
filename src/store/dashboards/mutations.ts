import { getStoreAccessors } from 'vuex-typescript';

import mutations from './mutations.helpers';
import { Dashboard, DashboardItem, DashboardState } from './state';
import { State as RootState } from '../state';
import store from '../index';

const { commit } = getStoreAccessors<DashboardState, RootState>('dashboards');

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
