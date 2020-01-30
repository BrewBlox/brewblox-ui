import { ref } from '@/helpers/component-ref';
import { WidgetFeature } from '@/store/features';

import widget from './SessionViewWidget.vue';
import { SessionViewConfig } from './types';

const feature: WidgetFeature<SessionViewConfig> = {
  id: 'SessionView',
  title: 'Session View (Deprecated)',
  component: ref(widget),
  wizard: false,
  widgetSize: {
    cols: 4,
    rows: 5,
  },
  generateConfig: () => ({ sessions: [] }),
};

export default feature;
