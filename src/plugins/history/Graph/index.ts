import { ref } from '@/helpers/component-ref';
import { WidgetFeature } from '@/store/features';

import { emptyGraphConfig } from '../getters';
import { GraphConfig } from '../types';
import { typeName } from './getters';
import widget from './GraphWidget.vue';

const feature: WidgetFeature<GraphConfig> = {
  id: typeName,
  title: 'Graph',
  component: ref(widget),
  wizard: true,
  generateConfig: emptyGraphConfig,
  widgetSize: {
    cols: 10,
    rows: 5,
  },
};

export default feature;
