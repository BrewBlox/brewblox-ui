import { ref } from '@/helpers/component-ref';
import { WidgetFeature } from '@/store/features';

import widget from './TiltWidget.vue';
import { TiltWidgetConfig } from './types';

const feature: WidgetFeature<TiltWidgetConfig> = {
  id: 'Tilt',
  title: 'Tilt',
  component: ref(widget),
  wizard: true,
  widgetSize: {
    cols: 4,
    rows: 4,
  },
  generateConfig: () => ({
    serviceId: null,
    color: null,
    hidden: {},
  }),
};

export default feature;
