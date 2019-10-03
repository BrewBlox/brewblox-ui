import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features';

import { typeName } from './getters';
import form from './GraphForm.vue';
import widget from './GraphWidget.vue';
import wizard from './GraphWizard.vue';

const feature: Feature = {
  id: typeName,
  displayName: 'Graph',
  widgetComponent: ref(widget),
  wizardComponent: ref(wizard),
  widgetSize: {
    cols: 10,
    rows: 5,
  },
};

export default feature;
