import getters from './getters';
import actions from './actions';
import mutations from './mutations';
import { Module } from 'vuex';
import { ProviderState } from './state';
import { RootState } from '../state';

const providers: Module<ProviderState, RootState> = {
  getters,
  actions,
  mutations,
  namespaced: true,
  state: {
    providers: {},
  },
};

export default providers;
