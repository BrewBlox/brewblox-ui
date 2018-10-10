import { RootStore } from '@/store/state';
import { addMetric } from '@/plugins/history/store/actions';
import { HistoryOptions, Metric, QueryResult } from '@/plugins/history/state';

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
  result: QueryResult,
) => {
  if (result.values && result.values.length > 0) {
    const resultCols = transpose(result.values);
    const time = resultCols[0].map(toMicroSeconds);

    result
      .columns
      .forEach((col: string, idx: number) => {
        if (idx === 0) {
          return; // skip time
        }
        const key = `${result.name}/${col}`;
        const value = metric.values[key] || {};
        metric.values[key] = {
          type: 'scatter',
          ...value,
          name: key,
          x: boundedConcat(value.x, time),
          y: boundedConcat(value.y, resultCols[idx]),
        };
      });
  }
  return metric;
};

export const addPlotlyMetric = async (
  store: RootStore,
  id: string,
  serviceId: string,
  options: HistoryOptions,
) =>
  addMetric(store, serviceId, {
    id,
    serviceId,
    transformer,
    options,
    values: {},
  });
