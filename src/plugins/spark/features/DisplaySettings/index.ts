import { Plugin } from 'vue';

import { systemBlockFeature } from '@/plugins/spark/generic';
import { sparkStore } from '@/plugins/spark/store';
import {
  BlockFieldSpec,
  BlockSpec,
  BlockType,
  DisplaySettingsBlock,
  DisplayTempUnit,
} from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils';
import { featureStore, WidgetFeature } from '@/store/features';

import widget from './DisplaySettingsWidget.vue';

const type = BlockType.DisplaySettings;

const plugin: Plugin = {
  install(app) {
    const blockSpec: BlockSpec<DisplaySettingsBlock> = {
      type,
      generate: () => ({
        name: 'Display settings',
        tempUnit: DisplayTempUnit.TEMP_CELSIUS,
        widgets: [],
        brightness: 255,
        timeZone: '',
      }),
    };

    const fieldSpecs: BlockFieldSpec<DisplaySettingsBlock>[] = [
      {
        type,
        key: 'name',
        title: 'Footer text',
        component: 'StringValEdit',
        generate: () => '',
      },
    ];

    const feature: WidgetFeature = {
      ...systemBlockFeature,
      id: type,
      title: 'Spark Display',
      role: 'Display',
      component: blockWidgetSelector(app, widget, type),
      widgetSize: {
        cols: 4,
        rows: 3,
      },
    };

    sparkStore.addBlockSpec(blockSpec);
    sparkStore.addFieldSpecs(fieldSpecs);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
