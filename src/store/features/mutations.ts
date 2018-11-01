import Vue from 'vue';
import { getStoreAccessors } from 'vuex-typescript';
import { FeatureState, Feature } from './state';
import { RootState } from '../state';

const { commit } = getStoreAccessors<FeatureState, RootState>('features');

const mutations = {
  create: (state: FeatureState, feature: Feature) =>
    Vue.set(state.features, feature.id, { ...feature }),

  mutate: (state: FeatureState, feature: Partial<Feature>) => {
    const id = feature.id || '';
    const existing = state.features[id];
    if (!existing) {
      throw new Error(`'${id}' does not exist`);
    }
    Vue.set(state.features, id, { ...existing, ...feature });
  },

  remove: (state: FeatureState, id: string) =>
    Vue.delete(state.features, id),
};

export default mutations;

export const createFeature = commit(mutations.create);
export const mutateFeature = commit(mutations.mutate);
export const removeFeature = commit(mutations.remove);
