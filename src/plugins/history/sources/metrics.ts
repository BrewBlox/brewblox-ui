import { historyStore } from '@/plugins/history/store';
import {
  DisplayNames,
  HistorySource,
  MetricsSource,
  QueryParams,
  TimeSeriesMetricsResult,
} from '@/plugins/history/types';

function metricsTransformer(
  source: HistorySource,
  result: TimeSeriesMetricsResult,
): MetricsSource {
  return {
    ...source,
    values: result.metrics.map(res => ({
      field: res.metric.__name__,
      time: res.value[0] * 1000,
      value: Number(res.value[1]),
    })),
  };
}

export async function addSource(
  id: string,
  params: QueryParams,
  renames: DisplayNames,
  fields: string[],
): Promise<void> {
  const validFields = fields.filter(field => !!field);
  if (validFields.length === 0) {
    return;
  }
  const source: MetricsSource = {
    id,
    params,
    renames,
    command: 'metrics',
    transformer: metricsTransformer,
    fields: validFields,
    values: [],
  };
  await historyStore.addSource(source);
}
