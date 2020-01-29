import { selector } from '@/helpers/component-ref';
import { WidgetFeature } from '@/store/features';

import { emptyGraphConfig } from '../getters';
import { typeName } from './getters';
import widget from './GraphWidget.vue';

const feature: WidgetFeature = {
  id: typeName,
  title: 'Graph',
  widgetComponent: selector(widget),
  wizardComponent: 'GenericWidgetWizard',
  generateConfig: emptyGraphConfig,
  widgetSize: {
    cols: 10,
    rows: 5,
  },
};

export default feature;
