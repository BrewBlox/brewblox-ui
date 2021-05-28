import { Plugin } from 'vue';

import { systemBlockFeature } from '@/plugins/spark/generic';
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
      fieldSpecs: [
        {
          key: 'name',
          title: 'Footer text',
          component: 'StringValEdit',
          generate: () => '',
        },
      ],
    };

    const feature: WidgetFeature = {
      ...systemBlockFeature,
      id: typeName,
      title: 'Spark Display',
      role: 'Display',
      component: blockWidgetSelector(app, widget, typeName),
      widgetSize: {
        cols: 4,
        rows: 3,
      },
    };

    sparkStore.addBlockSpec(spec);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
