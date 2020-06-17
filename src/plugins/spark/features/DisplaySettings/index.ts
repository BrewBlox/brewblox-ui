import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec, DisplaySettingsBlock } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './DisplaySettingsWidget.vue';

const typeName = 'DisplaySettings';

const block: BlockSpec<DisplaySettingsBlock> = {
  id: typeName,
  systemObject: true,
  generate: () => ({
    name: 'Display settings',
    tempUnit: 'Celsius',
    widgets: [],
    brightness: 255,
  }),
  fields: [
    {
      key: 'name',
      title: 'Footer text',
      component: 'StringValEdit',
      generate: () => '',
    },
  ],
};

const feature: WidgetFeature = {
  ...genericBlockFeature,
  id: typeName,
  title: 'Display Settings',
  role: 'Display',
  component: blockWidgetSelector(widget, typeName),
  widgetSize: {
    cols: 4,
    rows: 3,
  },
  // System objects can't be created or deleted
  wizard: false,
  removeActions: undefined,
};

export default { feature, block };
