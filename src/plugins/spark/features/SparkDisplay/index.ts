import { ref } from '@/helpers/component-ref';
import { WidgetFeature } from '@/store/features';

import widget from './SparkDisplayWidget.vue';
import { SparkDisplayConfig } from './types';

const feature: WidgetFeature<SparkDisplayConfig> = {
  id: 'SparkDisplay',
  title: 'Spark Sim Display',
  component: ref(widget),
  wizard: true,
  widgetSize: {
    cols: 4,
    rows: 3,
  },
  generateConfig: () => ({
    serviceId: null,
  }),
};

export default { feature };
