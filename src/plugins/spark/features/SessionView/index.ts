import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features/state';
import widget from './SessionViewWidget.vue';
import form from './SessionViewForm.vue';
import wizard from './SessionViewWizard.vue';
import { SessionViewConfig } from './state';

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

export default feature;
