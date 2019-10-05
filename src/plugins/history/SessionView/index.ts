import { ref, selector } from '@/helpers/component-ref';
import { Feature } from '@/store/features';

import widget from './SessionViewWidget.vue';
import wizard from './SessionViewWizard.vue';
import { SessionViewConfig } from './types';

const feature: Feature = {
  id: 'SessionView',
  displayName: 'Session View',
  widgetComponent: selector(widget),
  wizardComponent: ref(wizard),
  validator: (config: SessionViewConfig) => !!config.sessions,
  widgetSize: {
    cols: 4,
    rows: 5,
  },
};

export default feature;
