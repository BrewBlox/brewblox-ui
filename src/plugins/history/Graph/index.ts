import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features';

import { emptyGraphConfig } from '../getters';
import { typeName } from './getters';
import widget from './GraphWidget.vue';

const feature: Feature = {
  id: typeName,
  displayName: 'Graph',
  widgetComponent: ref(widget),
  wizardComponent: 'GenericWidgetWizard',
  generateConfig: emptyGraphConfig,
  widgetSize: {
    cols: 10,
    rows: 5,
  },
};

export default feature;
