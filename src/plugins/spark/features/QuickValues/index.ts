import { ref } from '@/helpers/component-ref';
import { WidgetFeature } from '@/store/features';

import widget from './QuickValuesWidget.vue';
import { QuickValuesConfig } from './types';

const feature: WidgetFeature<QuickValuesConfig> = {
  id: 'QuickValues',
  title: 'Quick Values',
  component: ref(widget),
  wizard: true,
  widgetSize: {
    cols: 4,
    rows: 4,
  },
  generateConfig: () => ({
    addr: {
      serviceId: null,
      id: null,
      type: null,
      field: null,
    },
    values: [],
    sliders: [],
  }),
};

export default { feature };
