import { read } from '@/helpers/dynamic-store';
import { Metric } from '@/plugins/history/state';
import { HistoryState } from './state';
import { RootStore } from '@/store/state';

export const typeName: string = 'History';

const getters = {
  metrics: (state: HistoryState): { [id: string]: Metric } => state.metrics || {},
  metricIds: (state: HistoryState): string[] => Object.keys(state.metrics),
  metricValues: (state: HistoryState): Metric[] => Object.values(state.metrics),
  availableKeys: (state: HistoryState): string[] => state.availableKeys,
};

export default getters;

export const metrics = read(getters.metrics);
export const metricIds = read(getters.metricIds);
export const metricValues = read(getters.metricValues);
export const availableKeys = read(getters.availableKeys);

export const metricById = (store: RootStore, serviceId: string, metricId: string): Metric => {
  const metric = metrics(store, serviceId)[metricId];
  if (metric === undefined) {
    throw new Error(`${metricId} not found in ${serviceId} store`);
  }
  return metric;
};

export const tryMetricById = (
  store: RootStore,
  serviceId: string,
  metricId: string,
): Metric | null =>
  metrics(store, serviceId)[metricId] || null;
