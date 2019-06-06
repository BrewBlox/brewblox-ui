import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features';

import form from './SessionViewForm.vue';
import widget from './SessionViewWidget.vue';
import wizard from './SessionViewWizard.vue';
import { SessionViewConfig } from './types';

const feature: Feature = {
  id: 'SessionView',
  displayName: 'Session View',
  widget: ref(widget),
  form: ref(form),
  wizard: ref(wizard),
  validator: (config: SessionViewConfig) => !!config.sessions,
  widgetSize: {
    cols: 4,
    rows: 5,
  },
};

export default { feature };
