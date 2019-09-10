import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features';

import form from './StepperForm.vue';
import widget from './StepperWidget.vue';
import wizard from './StepperWizard.vue';

const feature: Feature = {
  id: 'Stepper',
  displayName: 'Stepper',
  form: ref(form),
  widget: ref(widget),
  wizard: ref(wizard),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default { feature };
