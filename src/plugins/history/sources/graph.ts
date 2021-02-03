import forEach from 'lodash/forEach';
import last from 'lodash/last';
import parseDuration from 'parse-duration';

import { round } from '@/helpers/functional';
import { DEFAULT_PRECISION, MAX_POINTS } from '@/plugins/history/getters';
import { historyStore } from '@/plugins/history/store';
import {
  DisplayNames,
  GraphSource,
  GraphValueAxes,
  LabelPrecision,
  LineColors,
  QueryParams,
  QueryResult,
  QueryTarget,
} from '@/plugins/history/types';

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
  (source: GraphSource, key: string, value: number | undefined): string => {
    const label = source.renames[key] || key;
    const precision = source.precision[key] ?? DEFAULT_PRECISION;
    const prop = source.axes[key] === 'y2'
      ? 'style="color: #aef"'
      : '';
    return `<span ${prop}>${label}</span><br>${round(value, precision)}`;
  };

const transformer =
  (source: GraphSource, result: QueryResult): GraphSource => {
    if (result.values && result.values.length > 0) {
      const resultCols = transpose(result.values);
      const time = resultCols[0];
      source.usedPolicy = result.policy;

      // After connection interrupts, the data source may have been restarted
      // Remove earlier values if the service signals it's sending the initial batch
      if (result.initial) {
        source.values = {};
      }

      result
        .columns
        .forEach((col: string, idx: number) => {
          if (idx === 0) {
            return; // skip time
          }
          const colValues = resultCols[idx];
          const key = `${result.name}/${col}`;
          const existing = source.values[key];
          source.values[key] = {
            ...existing, // Plotly can set values
            type: 'scatter',
            mode: 'lines',
            name: valueName(source, key, last(colValues)),
            yaxis: source.axes[key] ?? 'y',
            line: { color: source.colors[key] },
            x: boundedConcat(existing?.x, time),
            y: boundedConcat(existing?.y, colValues),
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
    precision: LabelPrecision,
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
      precision,
      transformer,
      command: 'values',
      target: filteredTarget,
      values: {},
    };
    await historyStore.addSource(source);
  };
