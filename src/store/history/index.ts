import { Module } from 'vuex';
import { RootState } from '../state';
import { actions } from './actions';
import { getters } from './getters';
import { mutations } from './mutations';
import { HistoryState } from './state';

const features: Module<HistoryState, RootState> = {
  getters,
  actions,
  mutations,
  namespaced: true,
  state: {
    availableFields: {},
    listeners: {},
  },
};

export default features;
