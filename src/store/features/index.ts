import { Module } from 'vuex';
import { RootState } from '../state';
import { actions } from './actions';
import { getters } from './getters';
import { mutations } from './mutations';
import { FeatureState } from './state';

const features: Module<FeatureState, RootState> = {
  getters,
  actions,
  mutations,
  namespaced: true,
  state: {
    features: {},
  },
};

export default features;
