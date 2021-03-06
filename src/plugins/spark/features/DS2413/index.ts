import { Plugin } from 'vue';

import { discoveredBlockFeature } from '@/plugins/spark/generic';
import { sparkStore } from '@/plugins/spark/store';
import { BlockSpec, BlockType, DS2413Block } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils';
import { featureStore, WidgetFeature } from '@/store/features';

import widget from './DS2413Widget.vue';

const type = BlockType.DS2413;


const plugin: Plugin = {
  install(app) {

    const blockSpec: BlockSpec<DS2413Block> = {
      type,
      generate: () => ({
        address: '',
        connected: false,
        pins: [],
      }),
    };

    const feature: WidgetFeature = {
      ...discoveredBlockFeature,
      id: type,
      title: 'DS2413 Chip',
      role: 'Output',
      component: blockWidgetSelector(app, widget, type),
      widgetSize: {
        cols: 4,
        rows: 3,
      },
    };

    sparkStore.addBlockSpec(blockSpec);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
