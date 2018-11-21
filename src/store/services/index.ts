import getters from './getters';
import actions from './actions';
import mutations from './mutations';
import { Module } from 'vuex';
import { RootState } from '../state';
import { ServiceState } from './state';

const services: Module<ServiceState, RootState> = {
  getters,
  actions,
  mutations,
  namespaced: true,
  state: {
    services: {},
  },
};

export default services;
