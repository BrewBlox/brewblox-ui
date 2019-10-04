import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features';

import ChangeConfirmDialog from './ChangeConfirmDialog.vue';
import widget from './StepViewWidget.vue';
import wizard from './StepViewWizard.vue';

ref(ChangeConfirmDialog);

const feature: Feature = {
  id: 'StepView',
  displayName: 'Step View',
  widgetComponent: ref(widget),
  wizardComponent: ref(wizard),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default { feature };
