import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './DisplaySettingsWidget.vue';
import { typeName } from './getters';
import { DisplaySettingsData, DisplayTempUnit } from './types';

const block: BlockSpec = {
  id: typeName,
  systemObject: true,
  generate: (): DisplaySettingsData => ({
    name: 'Display settings',
    tempUnit: DisplayTempUnit.Celsius,
    widgets: [],
    brightness: 255,
  }),
  changes: [
    {
      key: 'name',
      title: 'Footer text',
      component: 'StringValEdit',
      generate: () => '',
    },
  ],
  presets: [],
};

const feature: WidgetFeature = {
  ...genericBlockFeature,
  id: typeName,
  title: 'Display Settings',
  role: 'Display',
  component: blockWidgetSelector(widget),
  widgetSize: {
    cols: 4,
    rows: 3,
  },
  // System objects can't be created or deleted
  wizard: false,
  removeActions: undefined,
};

export default { feature, block };
