import historyStore from '@/store/history';
import {
  DisplayNames,
  QueryParams,
  QueryResult,
  QueryTarget,
  GraphValueAxes,
  GraphValuesListener,
} from '@/store/history/types';
import parseDuration from 'parse-duration';
import { nanoToMilli } from '@/helpers/functional';
import forEach from 'lodash/forEach';

const MAX_POINTS = 5000;

const transpose = (matrix: any[][]): any[][] => matrix[0].map((_, idx) => matrix.map(row => row[idx]));

const boundedConcat =
  (left: number[] = [], right: number[] = [], maxLength: number = MAX_POINTS): number[] => {
    const sliced = Math.max((left.length + right.length) - maxLength, 0);
    if (sliced > left.length) {
      return right.slice(sliced - left.length);
    }
    if (sliced > 0) {
      return [...left.slice(sliced), ...right];
    }
    return [...left, ...right];
  };

const valueName =
  (listener: GraphValuesListener, key: string): string => {
    return listener.axes[key] === 'y2'
      ? `<span style="color: #aef">${listener.renames[key] || key}</span>`
      : `<span>${listener.renames[key] || key}</span>`;
  };

const valuesTransformer =
  (listener: GraphValuesListener, result: QueryResult): GraphValuesListener => {
    if (result.values && result.values.length > 0) {
      const resultCols = transpose(result.values);
      const time = resultCols[0].map(nanoToMilli);
      listener.usedPolicy = result.policy;

      result
        .columns
        .forEach((col: string, idx: number) => {
          if (idx === 0) {
            return; // skip time
          }
          const key = `${result.name}/${col}`;
          const value = listener.values[key] || {};
          listener.values[key] = {
            type: 'scatter',
            ...value,
            name: valueName(listener, key),
            yaxis: listener.axes[key] || 'y',
            x: boundedConcat(value.x, time),
            y: boundedConcat(value.y, resultCols[idx]),
          };
        });

      if (
        listener.params.duration
        && !listener.params.start
        && !listener.params.end
      ) {
        // timestamp in Ms that should be discarded
        const boundary = new Date().getTime() - parseDuration(listener.params.duration);
        forEach(listener.values, val => {
          const boundaryIdx = val.x.findIndex((x: number) => x > boundary);
          if (boundaryIdx > 0) {
            val.x = val.x.slice(boundaryIdx);
            val.y = val.y.slice(boundaryIdx);
          }
        });
      }
    }
    return listener;
  };

export const addPlotlyListener =
  async (
    id: string,
    params: QueryParams,
    renames: DisplayNames,
    axes: GraphValueAxes,
    target: QueryTarget,
  ): Promise<void> => {
    const filteredTarget = {
      ...target,
      fields: target.fields.filter(field => !!field),
    };
    if (filteredTarget.fields.length == 0) {
      return;
    }
    const listener: GraphValuesListener = {
      id,
      params,
      renames,
      axes,
      transformer: valuesTransformer,
      target: filteredTarget,
      values: {},
    };
    await historyStore.addValuesListener(listener);
  };
