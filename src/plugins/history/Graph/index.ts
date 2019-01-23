import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features/state';
import form from './GraphForm.vue';
import widget from './GraphWidget.vue';
import wizard from './GraphWizard.vue';

const feature: Feature = {
  id: 'Graph',
  displayName: 'Graph',
  widget: ref(widget),
  wizard: ref(wizard),
  form: ref(form),
  widgetSize: {
    cols: 10,
    rows: 5,
  },
};

export default feature;
