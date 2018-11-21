import getters from './getters';
import actions from './actions';
import mutations from './mutations';
import { Module } from 'vuex';
import { HistoryState } from './state';
import { RootState } from '../state';

const features: Module<HistoryState, RootState> = {
  getters,
  actions,
  mutations,
  namespaced: true,
  state: {
    availableFields: {},
    metrics: {},
  },
};

export default features;
