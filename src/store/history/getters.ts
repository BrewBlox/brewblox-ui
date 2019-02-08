import { createAccessors } from '@/helpers/static-store';
import { RootState, RootStore } from '@/store/state';
import { GetterTree } from 'vuex';
import { HistoryState, Metric } from './state';

const { read } = createAccessors('history');

export const MAX_POINTS: number = 2000;

export const getters: GetterTree<HistoryState, RootState> = {
  metrics: (state: HistoryState): { [id: string]: Metric } => state.metrics || {},
  metricIds: (state: HistoryState): string[] => Object.keys(state.metrics),
  metricValues: (state: HistoryState): Metric[] => Object.values(state.metrics),
  measurements: (state: HistoryState): string[] => Object.keys(state.availableFields),
  fields: (state: HistoryState): { [id: string]: string[] } => state.availableFields,
};

export const metrics = read(getters.metrics);
export const metricIds = read(getters.metricIds);
export const metricValues = read(getters.metricValues);
export const measurements = read(getters.measurements);
export const fields = read(getters.fields);

export const metricById = (store: RootStore, metricId: string): Metric => {
  const metric = metrics(store)[metricId];
  if (metric === undefined) {
    throw new Error(`${metricId} not found in history store`);
  }
  return metric;
};

export const tryMetricById = (store: RootStore, metricId: string): Metric | null =>
  metrics(store)[metricId] || null;

export const fieldsByMeasurement = (store: RootStore, measurement: string) =>
  fields(store)[measurement];
