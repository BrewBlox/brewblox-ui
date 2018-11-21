import Vue from 'vue';
import { getStoreAccessors } from 'vuex-typescript';
import { addVuexKey } from '@/store/vuex-key-fix';
import { ProviderState, Provider } from './state';
import { RootState } from '../state';

const { commit } = getStoreAccessors<ProviderState, RootState>('providers');

const mutations = {
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

addVuexKey(mutations);
export default mutations;

export const createProvider = commit(mutations.create);
export const mutateProvider = commit(mutations.mutate);
export const removeProvider = commit(mutations.remove);
