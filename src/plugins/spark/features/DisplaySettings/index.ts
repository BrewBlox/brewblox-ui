import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
import { sparkStore } from '@/plugins/spark/store';
import { BlockSpec, BlockType, DisplaySettingsBlock, DisplayTempUnit } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils';
import { featureStore, WidgetFeature } from '@/store/features';

import widget from './DisplaySettingsWidget.vue';

const typeName = BlockType.DisplaySettings;


const plugin: Plugin = {
  install(app) {

    const spec: BlockSpec<DisplaySettingsBlock> = {
      id: typeName,
      systemObject: true,
      generate: () => ({
        name: 'Display settings',
        tempUnit: DisplayTempUnit.TEMP_CELSIUS,
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
      component: blockWidgetSelector(app, widget, typeName),
      widgetSize: {
        cols: 4,
        rows: 3,
      },
      // System objects can't be created or deleted
      wizard: false,
      removeActions: undefined,
    };

    sparkStore.addBlockSpec(spec);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
