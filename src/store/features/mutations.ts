import { createAccessors } from '@/helpers/static-store';
import Vue from 'vue';
import { MutationTree } from 'vuex';
import { Feature, FeatureState, Arrangement } from './state';

const { commit } = createAccessors('features');

export const mutations: MutationTree<FeatureState> = {
  createFeature: (state: FeatureState, feature: Feature) =>
    Vue.set(state.features, feature.id, { ...feature }),

  createArrangement: (state: FeatureState, arr: Arrangement) =>
    Vue.set(state.arrangements, arr.id, { ...arr }),
};

export const createFeature = commit(mutations.createFeature);
export const createArrangement = commit(mutations.createArrangement);
