import { useDashboardStore } from '@/store/dashboards';
import { useWidgetStore, Widget } from '@/store/widgets';
import { createDialogPromise } from '@/utils/dialog';
import defaults from 'lodash/defaults';
import { typeName as graphType } from './Graph/const';
import {
  CsvPrecision,
  GraphConfig,
  MetricsConfig,
  QueryParams,
  QueryTarget,
  SharedGraphConfig,
} from './types';

export const defaultPresets = (): QueryParams[] => [
  { duration: '10m' },
  { duration: '1h' },
  { duration: '1d' },
  { duration: '3d' },
  { duration: '7d' },
  { duration: '14d' },
  { duration: '30d' },
];

export const emptyGraphConfig = (): GraphConfig => ({
  version: '1.0',
  layout: {},
  params: {},
  fields: [],
  renames: {},
  axes: {},
  colors: {},
  precision: {},
});

export const emptyMetricsConfig = (): MetricsConfig => ({
  version: '1.0',
  fields: [],
  renames: {},
  params: {},
  freshDuration: {},
  decimals: {},
});

export function sharedWidgetConfigs(
  excluded: string[] = [],
): SharedGraphConfig[] {
  const dashboardStore = useDashboardStore();
  const widgetStore = useWidgetStore();
  return widgetStore.widgets
    .filter(
      (widget) => widget.feature === graphType && !excluded.includes(widget.id),
    )
    .map((widget: Widget<GraphConfig>) => {
      const { id, title, config, dashboard } = widget;
      return {
        id,
        title: `[${dashboardStore.dashboardTitle(dashboard)}] ${title}`,
        config,
      };
    });
}

const precisionOpts: SelectOption<CsvPrecision>[] = [
  { label: 'Nanoseconds since 1-1-1970', value: 'ns' },
  { label: 'Milliseconds since 1-1-1970', value: 'ms' },
  { label: 'Seconds since 1-1-1970', value: 's' },
  { label: 'String (ISO-8601)', value: 'ISO8601' },
];

export async function selectGraphPrecision(): Promise<
  CsvPrecision | undefined
> {
  return await createDialogPromise({
    component: 'SelectDialog',
    componentProps: {
      modelValue: 'ms',
      selectOptions: precisionOpts,
      title: 'Select timestamp formatting',
      message:
        'The first value on every line in the CSV file shows the timestamp.',
      selectProps: {
        label: 'Formatting',
      },
    },
  });
}

export function upgradeGraphConfig(config: any): GraphConfig | null {
  if (config == null) {
    return emptyGraphConfig();
  }

  if (config.version == null) {
    if (config.targets) {
      config.fields = config.targets.flatMap((t: QueryTarget) =>
        t.fields.map((f) => `${t.measurement}/${f}`),
      );
    }

    // Only pick known properties
    const {
      version,
      params,
      fields,
      renames,
      layout,
      axes,
      colors,
      precision,
    } = config as GraphConfig;

    return defaults<GraphConfig, GraphConfig>(
      {
        version,
        params,
        fields,
        renames,
        layout,
        axes,
        colors,
        precision,
      },
      emptyGraphConfig(),
    );
  }

  return null;
}

export function upgradeMetricsConfig(config: any): MetricsConfig | null {
  if (config.version == null) {
    if (config.targets) {
      config.fields = config.targets.flatMap((t: QueryTarget) =>
        t.fields.map((f) => `${t.measurement}/${f}`),
      );
    }

    // Only pick known properties
    const { version, params, fields, renames, freshDuration, decimals } =
      config as MetricsConfig;

    return defaults<MetricsConfig, MetricsConfig>(
      {
        version,
        params,
        fields,
        renames,
        freshDuration,
        decimals,
      },
      emptyMetricsConfig(),
    );
  }

  return null;
}
