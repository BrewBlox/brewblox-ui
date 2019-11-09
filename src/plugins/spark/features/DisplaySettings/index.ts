import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec } from '@/plugins/spark/types';
import { Feature } from '@/store/features';

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

const feature: Feature = {
  ...genericBlockFeature,
  id: typeName,
  displayName: 'Display Settings',
  role: 'Display',
  widgetComponent: blockWidgetSelector(widget),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
  // DisplaySettings is a static system object, and can't be created or deleted
  wizardComponent: null,
  deleters: undefined,
};

export default { feature, block };
