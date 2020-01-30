import { ref } from '@/helpers/component-ref';
import { WidgetFeature } from '@/store/features';

import widget from './MetricsWidget.vue';
import { MetricsConfig } from './types';

const feature: WidgetFeature<MetricsConfig> = {
  id: 'Metrics',
  title: 'Metrics',
  component: ref(widget),
  wizard: true,
  generateConfig: () => ({
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
