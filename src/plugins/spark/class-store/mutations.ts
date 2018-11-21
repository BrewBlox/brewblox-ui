import { MutationTree } from 'vuex';
import { SparkClassState } from './state';
import Vue from 'vue';

export const mutations: MutationTree<SparkClassState> = {
  addListed: (state: SparkClassState, item: string) =>
    state.listed.push(item),
  addMapped: (state: SparkClassState, { key, val }) =>
    Vue.set(state.mapped, key, val),
};
