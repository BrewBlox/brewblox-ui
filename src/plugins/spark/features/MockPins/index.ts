import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec, MockPinsBlock } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './MockPinsWidget.vue';

const typeName = 'MockPins';

const block: BlockSpec<MockPinsBlock> = {
  id: typeName,
  generate: () => ({
    pins: [],
  }),
  fields: [],
};

const feature: WidgetFeature = {
  ...genericBlockFeature,
  id: typeName,
  title: 'Mock Pins',
  role: 'Output',
  component: blockWidgetSelector(widget, typeName),
  widgetSize: {
    cols: 4,
    rows: 4,
  },
};

export default { feature, block };
