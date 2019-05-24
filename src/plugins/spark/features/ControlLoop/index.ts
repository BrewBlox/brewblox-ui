import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features';
import widget from './ControlLoopWidget.vue';
import wizard from './ControlLoopWizard.vue';
import form from './ControlLoopForm.vue';

const feature: Feature = {
  id: 'ControlLoop',
  displayName: 'Control Loop',
  widget: ref(widget),
  wizard: ref(wizard),
  form: ref(form),
  widgetSize: {
    cols: 4,
    rows: 6,
  },
};

export default feature;
