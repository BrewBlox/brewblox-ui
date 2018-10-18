import { dispatch } from '@/helpers/dynamic-store';
import { RootStore } from '@/store/state';
import { HistoryContext } from './state';
import { fetchValueSource, fetchKnownKeys, validateService as validateServiceInApi } from './api';
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
    const {
      id,
      serviceId,
      params,
      target,
    } = metric;

    addMetricInStore(context, serviceId, metric);

    const source = await fetchValueSource(serviceId, params, target);
    source.onmessage = (event: MessageEvent) =>
      transformMetricInStore(context, serviceId, { id, result: JSON.parse(event.data) });
    source.onerror = () => source.close();

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
  const fields = await fetchKnownKeys(service.id);
  mutateAvailableKeysInStore(store, service.id, fields);
};

export const validateService = async (serviceId: string) =>
  validateServiceInApi(serviceId);
