import { dashboardStore } from '@/store/dashboards';
import { Widget, widgetStore } from '@/store/widgets';
import { createDialogPromise } from '@/utils/dialog';

import { typeName as graphType } from './Graph/const';
import { historyStore } from './store';
import { CsvPrecision, GraphConfig, SharedGraphConfig } from './types';

export const sharedWidgetConfigs = (excluded: string[] = []): SharedGraphConfig[] =>
  widgetStore.widgets
    .filter(widget => widget.feature === graphType && !excluded.includes(widget.id))
    .map((widget: Widget<GraphConfig>) => {
      const { id, title, config, dashboard } = widget;
      return { id, title: `[${dashboardStore.dashboardTitle(dashboard)}] ${title}`, config };
    });


const precisionOpts: SelectOption<CsvPrecision>[] = [
  { label: 'Nanoseconds since 1-1-1970', value: 'ns' },
  { label: 'Milliseconds since 1-1-1970', value: 'ms' },
  { label: 'Seconds since 1-1-1970', value: 's' },
  { label: 'String (ISO-8601)', value: 'ISO8601' },
];

export async function selectGraphPrecision(): Promise<CsvPrecision | undefined> {
  return await createDialogPromise({
    component: 'SelectDialog',
    componentProps: {
      modelValue: 'ms',
      selectOptions: precisionOpts,
      title: 'Select timestamp formatting',
      message: 'The first value on every line in the CSV file shows the timestamp.',
      selectProps: {
        label: 'Formatting',
      },
    },
  });
}

export async function saveGraphToFile(
  config: GraphConfig,
  precision: CsvPrecision,
  header: string,
): Promise<void> {
  await historyStore.downloadCsv({
    params: config.params,
    fields: config.targets.flatMap(t => t.fields.map(f => `${t.measurement}/${f}`)),
    precision,
    fileName: `${header}.csv`,
  });
}
