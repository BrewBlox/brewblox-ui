import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockSpec, BlockType, MockPinsBlock } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils';
import { useFeatureStore, WidgetFeature } from '@/store/features';

import widget from './MockPinsWidget.vue';

const type = BlockType.MockPins;

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<MockPinsBlock> = {
      type,
      generate: () => ({
        channels: [],
      }),
    };

    const feature: WidgetFeature = {
      ...genericBlockFeature,
      id: type,
      title: 'Mock Pins',
      role: 'Output',
      component: blockWidgetSelector(app, widget, type),
      widgetSize: {
        cols: 4,
        rows: 4,
      },
    };

    specStore.addBlockSpec(blockSpec);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
