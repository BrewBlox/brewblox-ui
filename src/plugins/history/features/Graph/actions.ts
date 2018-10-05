import { RootStore } from '@/store/state';
import { addMetric } from '@/plugins/history/store/actions';
import { HistoryOptions, Slice, Metric } from '@/plugins/history/state';

export { removeMetric } from '@/plugins/history/store/actions';

const toMicroSeconds = (nanoseconds: number) => Math.floor(nanoseconds / 1e6);

const transpose = (matrix: any[][]) => matrix[0].map((_, idx) => matrix.map(row => row[idx]));

const boundedConcat = (
  left: number[] = [],
  right: number[] = [],
  maxLength: number = 500,
) => {
  const sliced = Math.max((left.length + right.length) - maxLength, 0);
  if (sliced > left.length) {
    return right.slice(sliced - left.length);
  }
  if (sliced > 0) {
    return [...left.slice(sliced), ...right];
  }
  return [...left, ...right];
};

const transformer = (
  metric: Metric,
  slices: Slice[],
) => {
  if (slices && slices.length > 0) {
    const columns = transpose(slices);
    const time = columns[0].map(toMicroSeconds);
    metric.options.keys
      .forEach((key: string, idx: number) => {
        const value = metric.values[key] || { type: 'scatter', x: [], y: [] };
        value.x = boundedConcat(value.x, time);
        value.y = boundedConcat(value.y, columns[idx + 1]);
        metric.values[key] = value;
      });
  }
  return metric;
};

export const addPlotlyMetric = async (
  store: RootStore,
  id: string,
  serviceId: string,
  options: HistoryOptions,
  config: any,
) =>
  addMetric(store, serviceId, {
    id,
    serviceId,
    options,
    config,
    transformer,
    values: {},
  });
