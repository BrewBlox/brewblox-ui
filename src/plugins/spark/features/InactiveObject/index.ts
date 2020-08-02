import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockType, InactiveObjectBlock } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './InactiveObjectWidget.vue';

const typeName = BlockType.InactiveObject;

const feature: WidgetFeature<InactiveObjectBlock> = {
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
