import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features/state';
import widget from './MetricsWidget.vue';
import wizard from './MetricsWizard.vue';
import form from './MetricsForm.vue';

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
