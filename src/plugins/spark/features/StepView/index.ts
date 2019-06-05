import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features';

import form from './StepViewForm.vue';
import widget from './StepViewWidget.vue';
import wizard from './StepViewWizard.vue';

const feature: Feature = {
  id: 'StepView',
  displayName: 'Step View',
  form: ref(form),
  widget: ref(widget),
  wizard: ref(wizard),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default { feature };
