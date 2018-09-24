import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features/state';
import widget from './MetricsWidget.vue';
// import wizard from './MetricsWizard.vue';

const feature: Feature = {
  id: 'Metrics',
  displayName: 'Metrics',
  widget: ref(widget),
  validator: () => true,
};

export default feature;
