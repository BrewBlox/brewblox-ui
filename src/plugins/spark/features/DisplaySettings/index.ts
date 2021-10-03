import { Plugin } from 'vue';

import { systemBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import {
  BlockFieldSpec,
  BlockSpec,
  BlockType,
  DisplaySettingsBlock,
  DisplayTempUnit,
} from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils';
import { useFeatureStore, WidgetFeature } from '@/store/features';

import widget from './DisplaySettingsWidget.vue';

const type = BlockType.DisplaySettings;

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

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

    specStore.addBlockSpec(blockSpec);
    specStore.addFieldSpecs(fieldSpecs);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
