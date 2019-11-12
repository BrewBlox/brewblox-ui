import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features';

import widget from './MetricsWidget.vue';
import { MetricsConfig } from './types';

const feature: Feature = {
  id: 'Metrics',
  displayName: 'Metrics',
  widgetComponent: ref(widget),
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
