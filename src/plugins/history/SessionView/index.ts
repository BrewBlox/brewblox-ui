import { selector } from '@/helpers/component-ref';
import { Feature } from '@/store/features';

import widget from './SessionViewWidget.vue';
import { SessionViewConfig } from './types';

const feature: Feature = {
  id: 'SessionView',
  displayName: 'Session View',
  widgetComponent: selector(widget),
  widgetSize: {
    cols: 4,
    rows: 5,
  },
  generateConfig: (): SessionViewConfig => ({ sessions: [] }),
};

export default feature;
