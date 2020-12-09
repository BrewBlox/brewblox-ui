import { ref } from '@/helpers/component-ref';
import { WidgetFeature } from '@/store/features';

import { WebframeConfig } from './types';
import widget from './WebframeWidget.vue';

const feature: WidgetFeature<WebframeConfig> = {
  id: 'Webframe',
  title: 'Web Frame',
  component: ref(widget),
  wizard: true,
  widgetSize: {
    cols: 4,
    rows: 4,
  },
  generateConfig: () => ({
    url: '',
    scale: 1,
  }),
};

export default feature;
