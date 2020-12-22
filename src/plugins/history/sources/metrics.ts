import { historyStore } from '@/plugins/history/store';
import {
  DisplayNames,
  HistorySource,
  MetricsResult,
  MetricsSource,
  QueryParams,
  QueryTarget,
} from '@/plugins/history/types';

const metricsTransformer =
  (source: HistorySource, result: MetricsResult[]): MetricsSource => ({
    ...source,
    values: result.map(res => ({
      ...res,
      field: `${source.target.measurement}/${res.field}`,
    })),
  });


export const addSource =
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
    const source: MetricsSource = {
      id,
      params,
      renames,
      command: 'last_values',
      transformer: metricsTransformer,
      target: filteredTarget,
      values: [],
    };
    await historyStore.addSource(source);
  };
