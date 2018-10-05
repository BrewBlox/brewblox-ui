import { dispatch } from '@/helpers/dynamic-store';
import { RootStore } from '@/store/state';
import { HistoryContext } from './state';
import { fetchValueSource, fetchValues, fetchKnownKeys } from './api';
import {
  addMetric as addMetricInStore,
  updateMetric as updateMetricInStore,
  transformMetric as transformMetricInStore,
  removeMetric as removeMetricInStore,
  mutateAvailableKeys as mutateAvailableKeysInStore,
} from './mutations';
import { Service } from '@/store/services/state';
import { Metric } from '@/plugins/history/state';

const actions = {
  add: async (context: HistoryContext, metric: Metric) => {
    const { id, serviceId, options } = metric;

    addMetricInStore(context, serviceId, metric);
    transformMetricInStore(
      context,
      serviceId,
      { id, slices: await fetchValues(serviceId, options) },
    );

    const source = await fetchValueSource(serviceId, options);
    source.onmessage = (event: MessageEvent) =>
      transformMetricInStore(context, serviceId, { id, slices: JSON.parse(event.data).values });

    updateMetricInStore(context, metric.serviceId, { id, source });
  },

  remove: async (context: HistoryContext, metric: Metric) => {
    removeMetricInStore(context, metric.serviceId, metric);
    if (metric.source) {
      metric.source.close();
    }
  },
};

export default actions;

export const addMetric = dispatch(actions.add);
export const removeMetric = dispatch(actions.remove);

export const fetch = async (store: RootStore, service: Service) => {
  const keys = await fetchKnownKeys(service.id);
  mutateAvailableKeysInStore(store, service.id, keys);
};
