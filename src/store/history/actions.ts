import { createAccessors } from '@/helpers/static-store';
import { HistoryState, Metric } from '@/store/history/state';
import { RootState, RootStore } from '@/store/state';
import { ActionTree } from 'vuex';
import {
  fetchKnownKeys as fetchKnownKeysInApi,
  fetchValueSource,
  validateService as validateServiceInApi,
} from './api';
import {
  addMetric as addMetricInStore,
  mutateAvailableKeys as mutateAvailableKeysInStore,
  removeMetric as removeMetricInStore,
  transformMetric as transformMetricInStore,
  updateMetric as updateMetricInStore,
} from './mutations';
import { HistoryContext } from './state';

const { dispatch } = createAccessors('history');

export const actions: ActionTree<HistoryState, RootState> = {
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

export const addMetric = dispatch(actions.add);
export const removeMetric = dispatch(actions.remove);

export const fetchKnownKeys =
  async (store: RootStore): Promise<void> =>
    mutateAvailableKeysInStore(store, await fetchKnownKeysInApi());

export const validateService =
  async (): Promise<boolean> => validateServiceInApi();
