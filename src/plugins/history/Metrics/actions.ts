import historyStore from '@/store/history';
import {
  DisplayNames,
  Listener,
  QueryParams,
  QueryTarget,
} from '@/store/history/types';
import { MetricsResult } from './types';
import { nanoToMilli } from '@/helpers/functional';

const metricsTransformer =
  (listener: Listener, result: MetricsResult[]): Listener => ({
    ...listener,
    values: result.map(res => {
      return {
        ...res,
        field: `${listener.target.measurement}/${res.field}`,
        time: res.time ? nanoToMilli(res.time) : null,
      };
    }),
  });


export const addListener =
  async (
    id: string,
    params: QueryParams,
    renames: DisplayNames,
    target: QueryTarget,
  ): Promise<void> => {
    const filteredTarget = {
      ...target,
      fields: target.fields.filter(field => !!field),
    };
    if (filteredTarget.fields.length === 0) {
      return;
    }
    const listener: Listener = {
      id,
      params,
      renames,
      transformer: metricsTransformer,
      target: filteredTarget,
      values: [],
    };
    await historyStore.addMetricsListener(listener);
  };
