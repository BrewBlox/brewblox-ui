import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockType } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './DeprecatedObjectWidget.vue';

const feature: WidgetFeature = {
  ...genericBlockFeature,
  id: BlockType.DeprecatedObject,
  title: 'Deprecated Object',
  role: 'Other',
  component: blockWidgetSelector(widget, null),
  wizard: false,
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default { feature };
