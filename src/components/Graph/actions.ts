import { addValuesListener } from '@/store/history/actions';
import { MAX_POINTS } from '@/store/history/getters';
import {
  DisplayNames,
  QueryParams,
  QueryResult,
  QueryTarget,
  GraphValueAxes,
  GraphValuesListener,
} from '@/store/history/state';
import { RootStore } from '@/store/state';
import parseDuration from 'parse-duration';
import { nanoToMilli } from '@/helpers/functional';

export { removeListener } from '@/store/history/actions';

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
        Object
          .values(listener.values)
          .forEach((val: any) => {
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
    store: RootStore,
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
    if (filteredTarget.fields.length > 0) {
      addValuesListener(store, {
        id,
        params,
        renames,
        axes,
        transformer: valuesTransformer,
        target: filteredTarget,
        values: {},
      });
    }
  };
