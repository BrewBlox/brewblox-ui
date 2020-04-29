import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import { typeName } from './getters';
import widget from './MockPinsWidget.vue';
import { MockPinsData } from './types';

const block: BlockSpec<MockPinsData> = {
  id: typeName,
  generate: () => ({
    pins: [],
  }),
  changes: [],
  presets: [],
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
