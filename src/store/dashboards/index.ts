import getters from './getters';
import actions from './actions';
import mutations from './mutations';
import { Module } from 'vuex';
import { DashboardState } from './state';
import { RootState } from '../state';

const dashboards: Module<DashboardState, RootState> = {
  getters,
  actions,
  mutations,
  namespaced: true,
  state: {
    dashboards: {},
    items: {},
  },
};

export default dashboards;
