import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
import { sparkStore } from '@/plugins/spark/store';
import { BlockSpec, BlockType, DS2413Block } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils';
import { featureStore, WidgetFeature } from '@/store/features';

import widget from './DS2413Widget.vue';

const typeName = BlockType.DS2413;


const plugin: Plugin = {
  install(app) {

    const spec: BlockSpec<DS2413Block> = {
      id: typeName,
      discovered: true,
      generate: () => ({
        address: '',
        connected: false,
        pins: [],
      }),
      fields: [],
    };

    const feature: WidgetFeature = {
      ...genericBlockFeature,
      id: typeName,
      title: 'DS2413 Chip',
      role: 'Output',
      component: blockWidgetSelector(app, widget, typeName),
      widgetSize: {
        cols: 4,
        rows: 3,
      },
      wizard: 'BlockDiscoveryWizard',
    };

    sparkStore.addBlockSpec(spec);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
