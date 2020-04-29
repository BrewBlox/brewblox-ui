import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { WidgetFeature } from '@/store/features';

import { typeName } from './getters';
import widget from './InactiveObjectWidget.vue';

const feature: WidgetFeature = {
  ...genericBlockFeature,
  id: typeName,
  title: 'Inactive Block',
  component: blockWidgetSelector(widget, typeName),
  wizard: false,
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default { feature };
