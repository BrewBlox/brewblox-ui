import { Module } from 'vuex';
import { RootState } from '../state';
import { actions } from './actions';
import { getters } from './getters';
import { mutations } from './mutations';
import { ProviderState } from './state';

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
