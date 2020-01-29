import { selector } from '@/helpers/component-ref';
import { WidgetFeature } from '@/store/features';

import widget from './SessionViewWidget.vue';
import { SessionViewConfig } from './types';

const feature: WidgetFeature = {
  id: 'SessionView',
  title: 'Session View (Deprecated)',
  widgetComponent: selector(widget),
  widgetSize: {
    cols: 4,
    rows: 5,
  },
  generateConfig: (): SessionViewConfig => ({ sessions: [] }),
};

export default feature;
