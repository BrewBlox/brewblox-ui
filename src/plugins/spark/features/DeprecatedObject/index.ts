import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { WidgetFeature } from '@/store/features';

import widget from './DeprecatedObjectWidget.vue';

const feature: WidgetFeature = {
  ...genericBlockFeature,
  id: 'DeprecatedObject',
  title: 'Deprecated Object',
  role: 'Other',
  widgetComponent: blockWidgetSelector(widget),
  wizardComponent: null,
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default { feature };
