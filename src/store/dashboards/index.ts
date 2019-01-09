import { Module } from 'vuex';
import { RootState } from '../state';
import { actions } from './actions';
import { getters } from './getters';
import { mutations } from './mutations';
import { DashboardState } from './state';

const dashboards: Module<DashboardState, RootState> = {
  getters,
  actions,
  mutations,
  namespaced: true,
  state: {
    replicatingDashboards: false,
    dashboards: {},
    replicatingItems: false,
    items: {},
  },
};

export default dashboards;
