import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
import { sparkStore } from '@/plugins/spark/store';
import { BlockSpec, BlockType, MockPinsBlock } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils';
import { featureStore, WidgetFeature } from '@/store/features';

import widget from './MockPinsWidget.vue';

const typeName = BlockType.MockPins;

const plugin: Plugin = {
  install(app) {

    const spec: BlockSpec<MockPinsBlock> = {
      id: typeName,
      generate: () => ({
        pins: [],
      }),
      fieldSpecs: [],
    };

    const feature: WidgetFeature = {
      ...genericBlockFeature,
      id: typeName,
      title: 'Mock Pins',
      role: 'Output',
      component: blockWidgetSelector(app, widget, typeName),
      widgetSize: {
        cols: 4,
        rows: 4,
      },
    };

    sparkStore.addBlockSpec(spec);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
