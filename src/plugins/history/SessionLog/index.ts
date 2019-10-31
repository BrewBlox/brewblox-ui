import { ref, selector } from '@/helpers/component-ref';
import { Feature } from '@/store/features';

import widget from './SessionLogWidget.vue';
import wizard from './SessionLogWizard.vue';

const feature: Feature = {
  id: 'SessionLog',
  displayName: 'Session Log',
  widgetComponent: selector(widget),
  wizardComponent: ref(wizard),
  widgetSize: {
    cols: 4,
    rows: 5,
  },
};

export default feature;
