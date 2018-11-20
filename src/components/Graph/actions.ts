import { RootStore } from '@/store/state';
import { addMetric } from '@/store/history/actions';
import {
  QueryParams,
  Metric,
  QueryResult,
  QueryTarget,
  DisplayNames,
} from '@/store/history/state';
import parseDuration from 'parse-duration';

export { removeMetric } from '@/store/history/actions';

const nanoToMilli = (nano: number) => Math.floor(nano / 1e6);

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
    const time = resultCols[0].map(nanoToMilli);

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
          name: metric.renames[key] || key,
          x: boundedConcat(value.x, time),
          y: boundedConcat(value.y, resultCols[idx]),
        };
      });

    if (
      metric.params.duration
      && !metric.params.start
      && !metric.params.end
    ) {
      // timestamp in Ms that should be discarded
      const boundary = new Date().getTime() - parseDuration(metric.params.duration);
      Object
        .values(metric.values)
        .forEach((val: any) => {
          const boundaryIdx = val.x.findIndex((x: number) => x > boundary);
          if (boundaryIdx > 0) {
            val.x = val.x.slice(boundaryIdx);
            val.y = val.y.slice(boundaryIdx);
          }
        });
    }
  }
  return metric;
};

export const addPlotlyMetric = async (
  store: RootStore,
  id: string,
  params: QueryParams,
  renames: DisplayNames,
  target: QueryTarget,
) => {
  const filteredTarget = {
    ...target,
    fields: target.fields.filter(field => !!field),
  };
  if (filteredTarget.fields.length > 0) {
    addMetric(store, {
      id,
      transformer,
      params,
      renames,
      target: filteredTarget,
      values: {},
    });
  }
};
