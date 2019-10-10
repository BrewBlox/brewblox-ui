import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features';

import widget from './StepperWidget.vue';
import wizard from './StepperWizard.vue';


const feature: Feature = {
  id: 'Stepper',
  displayName: 'Stepper',
  widgetComponent: ref(widget),
  wizardComponent: ref(wizard),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default { feature };
