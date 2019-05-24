import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features';

import form from './MetricsForm.vue';
import widget from './MetricsWidget.vue';
import wizard from './MetricsWizard.vue';

const feature: Feature = {
  id: 'Metrics',
  displayName: 'Metrics',
  widget: ref(widget),
  wizard: ref(wizard),
  form: ref(form),
  widgetSize: {
    cols: 4,
    rows: 4,
  },
};

export default feature;
