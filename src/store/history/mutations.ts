import { createAccessors } from '@/helpers/static-store';
import Vue from 'vue';
import { HistoryState, Metric, QueryResult } from './state';

const { commit } = createAccessors('history');

export const mutations = {
  add: (state: HistoryState, metric: Metric) =>
    Vue.set(state.metrics, metric.id, metric),

  remove: (state: HistoryState, metric: Metric) =>
    Vue.delete(state.metrics, metric.id),

  update: (state: HistoryState, metric: Partial<Metric>) => {
    const id = metric.id || '';
    const existing = state.metrics[id];
    if (metric === undefined) {
      throw new Error(`${id} not found in store`);
    }
    Vue.set(state.metrics, id, { ...existing, ...metric });
  },

  transform: (state: HistoryState, { id, result }: { id: string, result: QueryResult }) => {
    const metric: Metric = state.metrics[id];
    if (metric !== undefined) {
      Vue.set(state.metrics, id, { ...metric.transformer(metric, result) });
    }
  },

  setAvailableFields: (state: HistoryState, fields: { [id: string]: string[] }) =>
    Vue.set(state, 'availableFields', { ...fields }),
};

export const addMetric = commit(mutations.add);
export const removeMetric = commit(mutations.remove);
export const updateMetric = commit(mutations.update);
export const transformMetric = commit(mutations.transform);
export const mutateAvailableKeys = commit(mutations.setAvailableFields);
