import { historyStore } from '@/plugins/history/store';
import {
  DisplayNames,
  HistorySource,
  MetricsSource,
  QueryParams,
  QueryTarget,
  TsdbMetricsResult,
} from '@/plugins/history/types';

function metricsTransformer(source: HistorySource, result: TsdbMetricsResult): MetricsSource {
  return {
    ...source,
    values: result.metrics.map(res => ({
      field: res.metric.__name__,
      time: res.value[0] * 1000,
      value: Number(res.value[1]),
    })),
  };
}

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
      command: 'metrics',
      transformer: metricsTransformer,
      target: filteredTarget,
      values: [],
    };
    await historyStore.addSource(source);
  };
