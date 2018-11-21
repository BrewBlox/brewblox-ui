import getters from './getters';
import actions from './actions';
import mutations from './mutations';
import { Module } from 'vuex';
import { FeatureState } from './state';
import { RootState } from '../state';

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
