import { createAccessors } from '@/helpers/static-store';
import Vue from 'vue';
import { MutationTree } from 'vuex';
import { HistoryState, Listener, QueryResult } from './state';

const { commit } = createAccessors('history');

export const mutations: MutationTree<HistoryState> = {
  add: (state: HistoryState, listener: Listener) =>
    Vue.set(state.listeners, listener.id, listener),

  remove: (state: HistoryState, listener: Listener) =>
    Vue.delete(state.listeners, listener.id),

  update: (state: HistoryState, listener: Partial<Listener>) => {
    const id = listener.id || '';
    const existing = state.listeners[id];
    if (listener === undefined) {
      throw new Error(`${id} not found in store`);
    }
    Vue.set(state.listeners, id, { ...existing, ...listener });
  },

  transform: (state: HistoryState, { id, result }: { id: string; result: QueryResult }) => {
    const listener: Listener = state.listeners[id];
    if (listener !== undefined) {
      Vue.set(state.listeners, id, { ...listener.transformer(listener, result) });
    }
  },

  setAvailableFields: (state: HistoryState, fields: { [id: string]: string[] }) =>
    Vue.set(state, 'availableFields', { ...fields }),
};

export const addListener = commit(mutations.add);
export const removeListener = commit(mutations.remove);
export const updateListener = commit(mutations.update);
export const transformListener = commit(mutations.transform);
export const mutateAvailableKeys = commit(mutations.setAvailableFields);
