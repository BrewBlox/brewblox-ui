import { Module } from 'vuex';
import { RootState } from '../state';
import { actions } from './actions';
import { getters } from './getters';
import { mutations } from './mutations';
import { ServiceState } from './state';

const services: Module<ServiceState, RootState> = {
  getters,
  actions,
  mutations,
  namespaced: true,
  state: {
    replicating: false,
    services: {},
  },
};

export default services;
