import { dispatch } from '@/helpers/dynamic-store';
import { ExampleState, ExampleContext } from './state';
import { getBackend, getExternal } from './api';
import { ActionTree } from 'vuex';
import { RootState } from '@/store/state';

// Standard declaration of VueX actions
export const actions: ActionTree<ExampleState, RootState> = {
  fetchBackend: async (context: ExampleContext, url: string) =>
    getBackend(url)
      .then(content => context.commit('addMessage', { url, content, ok: true }))
      .catch(content => context.commit('addMessage', { url, content, ok: false })),

  fetchExternal: async (context: ExampleContext, url: string) =>
    getExternal(url)
      .then(content => context.commit('addMessage', { url, content, ok: true }))
      .catch(content => context.commit('addMessage', { url, content, ok: false })),
};

// Note: we are using the dispatch() function from the dynamic-store helper
// This adds a required moduleId argument
// Example call:
//    fetchBackend(this.$store, MODULE_ID, '/datastore')
export const fetchBackend = dispatch(actions.fetchBackend);
export const fetchExternal = dispatch(actions.fetchExternal);
