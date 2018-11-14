import { getStoreAccessors } from 'vuex-typescript';
import { RootStore, RootState } from '@/store/state';
import { HistoryContext, HistoryState } from './state';
import {
  fetchValueSource,
  fetchKnownKeys as fetchKnownKeysInApi,
  validateService as validateServiceInApi,
} from './api';
import {
  addMetric as addMetricInStore,
  updateMetric as updateMetricInStore,
  transformMetric as transformMetricInStore,
  removeMetric as removeMetricInStore,
  mutateAvailableKeys as mutateAvailableKeysInStore,
} from './mutations';
import { Metric } from '@/store/history/state';

const { dispatch } = getStoreAccessors<HistoryState, RootState>('history');

const actions = {
  add: async (context: HistoryContext, metric: Metric) => {
    const {
      id,
      params,
      target,
    } = metric;

    addMetricInStore(context, metric);

    const source = await fetchValueSource(params, target);
    source.onmessage = (event: MessageEvent) =>
      transformMetricInStore(context, { id, result: JSON.parse(event.data) });
    source.onerror = () => source.close();

    updateMetricInStore(context, { id, source });
  },

  remove: async (context: HistoryContext, metric: Metric) => {
    removeMetricInStore(context, metric);
    if (metric.source) {
      metric.source.close();
    }
  },
};

export default actions;

export const addMetric = dispatch(actions.add);
export const removeMetric = dispatch(actions.remove);

export const fetchKnownKeys = async (store: RootStore) =>
  mutateAvailableKeysInStore(store, await fetchKnownKeysInApi());

export const validateService = async () =>
  validateServiceInApi();
