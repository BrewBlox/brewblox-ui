import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockSpec } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils/components';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { BlockType, MockPinsBlock } from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import widget from './MockPinsWidget.vue';

const type = BlockType.MockPins;

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<MockPinsBlock> = {
      type,
      generate: (): MockPinsBlock['data'] => ({
        channels: [],
      }),
      analyze: () => 'Active',
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
