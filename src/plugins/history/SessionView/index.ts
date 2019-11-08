import { selector } from '@/helpers/component-ref';
import { Feature } from '@/store/features';

import widget from './SessionViewWidget.vue';

const feature: Feature = {
  id: 'SessionView',
  displayName: 'Session View',
  widgetComponent: selector(widget),
  widgetSize: {
    cols: 4,
    rows: 5,
  },
  generateConfig: () => ({ sessions: [] }),
};

export default feature;
