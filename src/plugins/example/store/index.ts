import { registerService } from '@/helpers/dynamic-store';
import { RootState, RootStore } from '@/store/state';
import { Module } from 'vuex';
import { actions } from './actions';
import { getters } from './getters';
import { mutations } from './mutations';
import { ExampleState } from './state';

const module: Module<ExampleState, RootState> = {
  actions,
  getters,
  mutations,
  namespaced: true,
  // The state is declared as a function so it can be registered multiple times
  state: () => ({
    messages: [],
  }),
};

// After calling this, there is a new submodule in the global VueX store
// It can be accessed using the getters / mutations / actions in this directory
export const register =
  async (store: RootStore, moduleId: string): Promise<void> =>
    registerService(store, moduleId, module);
