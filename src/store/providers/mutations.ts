import { createAccessors } from '@/helpers/static-store';
import Vue from 'vue';
import { MutationTree } from 'vuex';
import { Provider, ProviderState } from './state';

const { commit } = createAccessors('providers');

export const mutations: MutationTree<ProviderState> = {
  create: (state: ProviderState, provider: Provider) => {
    Vue.set(state.providers, provider.id, { ...provider });
  },

  mutate: (state: ProviderState, provider: Partial<Provider>) => {
    const id = provider.id || '';
    const existing = state.providers[id];
    if (!existing) {
      throw new Error(`'${id}' does not exist`);
    }
    Vue.set(state.providers, id, { ...existing, ...provider });
  },

  remove: (state: ProviderState, id: string) => {
    Vue.delete(state.providers, id);
  },
};

export const createProvider = commit(mutations.create);
export const mutateProvider = commit(mutations.mutate);
export const removeProvider = commit(mutations.remove);
