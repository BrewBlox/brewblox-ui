import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features';

import widget from './MetricsWidget.vue';
import wizard from './MetricsWizard.vue';

const feature: Feature = {
  id: 'Metrics',
  displayName: 'Metrics',
  widgetComponent: ref(widget),
  wizardComponent: ref(wizard),
  widgetSize: {
    cols: 4,
    rows: 4,
  },
};

export default feature;
