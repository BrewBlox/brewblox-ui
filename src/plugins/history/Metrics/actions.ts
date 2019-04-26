import { addMetricsListener } from '@/store/history/actions';
import {
  DisplayNames,
  Listener,
  QueryParams,
  QueryTarget,
} from '@/store/history/state';
import { RootStore } from '@/store/state';
import { MetricsResult } from './state';
import { nanoToMilli } from '@/helpers/functional';

export { removeListener } from '@/store/history/actions';

const metricsTransformer =
  (listener: Listener, result: MetricsResult[]): Listener => ({
    ...listener,
    values: result.map(res => {
      const key = `${listener.target.measurement}/${res.field}`;
      return {
        ...res,
        field: listener.renames[key] || key,
        time: res.time ? nanoToMilli(res.time) : null,
      };
    }),
  });


export const addListener =
  async (
    store: RootStore,
    id: string,
    params: QueryParams,
    renames: DisplayNames,
    target: QueryTarget,
  ): Promise<void> => {
    const filteredTarget = {
      ...target,
      fields: target.fields.filter(field => !!field),
    };
    if (filteredTarget.fields.length > 0) {
      addMetricsListener(store, {
        id,
        params,
        renames,
        transformer: metricsTransformer,
        target: filteredTarget,
        values: [],
      });
    }
  };
