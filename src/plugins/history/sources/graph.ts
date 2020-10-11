import forEach from 'lodash/forEach';
import parseDuration from 'parse-duration';

import { historyStore } from '@/plugins/history/store';
import {
  DisplayNames,
  GraphSource,
  GraphValueAxes,
  LineColors,
  QueryParams,
  QueryResult,
  QueryTarget,
} from '@/plugins/history/types';

const MAX_POINTS = 5000;

const transpose = (matrix: any[][]): any[][] => matrix[0].map((_, idx) => matrix.map(row => row[idx]));

const boundedConcat =
  (left: number[] = [], right: number[] = [], maxLength: number = MAX_POINTS): number[] => {
    const sliced = Math.max((left.length + right.length) - maxLength, 0);
    if (sliced > left.length) {
      return right.slice(sliced - left.length);
    }
    if (sliced > 0) {
      const result = left.slice(sliced);
      result.push(...right);
      return result;
    }
    return [...left, ...right];
  };

const valueName =
  (source: GraphSource, key: string): string => {
    const label = source.renames[key] || key;
    return source.axes[key] === 'y2'
      ? `<span style="color: #aef">${label}</span>`
      : `<span>${label}</span>`;
  };

const transformer =
  (source: GraphSource, result: QueryResult): GraphSource => {
    if (result.values && result.values.length > 0) {
      const resultCols = transpose(result.values);
      const time = resultCols[0];
      source.usedPolicy = result.policy;

      result
        .columns
        .forEach((col: string, idx: number) => {
          if (idx === 0) {
            return; // skip time
          }
          const key = `${result.name}/${col}`;
          const value = source.values[key] || {};
          source.values[key] = {
            type: 'scatter',
            ...value,
            name: valueName(source, key),
            yaxis: source.axes[key] || 'y',
            line: { color: source.colors[key] },
            x: boundedConcat(value.x, time),
            y: boundedConcat(value.y, resultCols[idx]),
          };
        });

      if (
        source.params.duration
        && !source.params.start
        && !source.params.end
      ) {
        // timestamp in Ms that should be discarded
        const boundary = new Date().getTime() - parseDuration(source.params.duration);
        forEach(source.values, val => {
          const boundaryIdx = val.x.findIndex((x: number) => x > boundary);
          if (boundaryIdx > 0) {
            val.x = val.x.slice(boundaryIdx);
            val.y = val.y.slice(boundaryIdx);
          }
        });
      }
    }
    return source;
  };

export const addSource =
  async (
    id: string,
    params: QueryParams,
    renames: DisplayNames,
    axes: GraphValueAxes,
    colors: LineColors,
    target: QueryTarget,
  ): Promise<void> => {
    const filteredTarget = {
      ...target,
      fields: target.fields.filter(field => !!field),
    };
    if (filteredTarget.fields.length == 0) {
      return;
    }
    const source: GraphSource = {
      id,
      params,
      renames,
      axes,
      colors,
      transformer,
      target: filteredTarget,
      values: {},
    };
    await historyStore.addValuesSource(source);
  };
