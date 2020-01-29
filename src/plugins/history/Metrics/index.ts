import { selector } from '@/helpers/component-ref';
import { WidgetFeature } from '@/store/features';

import widget from './MetricsWidget.vue';
import { MetricsConfig } from './types';

const feature: WidgetFeature = {
  id: 'Metrics',
  title: 'Metrics',
  widgetComponent: selector(widget),
  generateConfig: (): MetricsConfig => ({
    targets: [],
    renames: {},
    params: {},
    freshDuration: {},
    decimals: {},
  }),
  widgetSize: {
    cols: 4,
    rows: 4,
  },
};

export default feature;
