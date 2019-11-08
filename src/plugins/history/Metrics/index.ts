import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features';

import widget from './MetricsWidget.vue';

const feature: Feature = {
  id: 'Metrics',
  displayName: 'Metrics',
  widgetComponent: ref(widget),
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
