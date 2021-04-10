import { dashboardStore, Widget } from '@/store/dashboards';
import { createDialogPromise } from '@/utils/dialog';
import { saveFile } from '@/utils/import-export';

import { typeName as graphType } from './Graph/getters';
import { historyStore } from './store';
import { GraphConfig, SharedGraphConfig } from './types';

export const sharedWidgetConfigs = (excluded: string[] = []): SharedGraphConfig[] =>
  dashboardStore.widgets
    .filter(widget => widget.feature === graphType && !excluded.includes(widget.id))
    .map((widget: Widget<GraphConfig>) => {
      const { id, title, config, dashboard } = widget;
      return { id, title: `[${dashboardStore.dashboardTitle(dashboard)}] ${title}`, config };
    });

type ExportPrecision = 'ns' | 'ms' | 's' | 'ISO8601';

const precisionOpts: SelectOption<ExportPrecision>[] = [
  { label: 'Nanoseconds since 1-1-1970', value: 'ns' },
  { label: 'Milliseconds since 1-1-1970', value: 'ms' },
  { label: 'Seconds since 1-1-1970', value: 's' },
  { label: 'String (ISO-8601)', value: 'ISO8601' },
];

export async function selectGraphPrecision(): Promise<ExportPrecision | undefined> {
  return await createDialogPromise({
    component: 'SelectDialog',
    componentProps: {
      value: 'ms',
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
  precision: ExportPrecision,
  header: string,
): Promise<void> {
  const isText = precision === 'ISO8601';
  const epoch = isText ? 'ms' : precision;
  const params = { ...config.params, policy: 'downsample_1m' };

  for (const target of config.targets) {
    const result = await historyStore.fetchValues([params, target, epoch]);
    if (isText) {
      result
        .values
        .forEach(slice => slice[0] = new Date(slice[0]).toISOString() as any);
    }
    const lines: string[] = [
      result.columns.join(),
      ...result
        .values
        .map(slice => slice.map(v => v === null ? '' : v.toString()).join()),
    ];
    saveFile(lines.join('\n'), `${header}__${result.name}.csv`, true);
  }
}
