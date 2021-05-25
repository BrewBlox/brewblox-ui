import { Plugin } from 'vue';

import { discoveredBlockFeature } from '@/plugins/spark/generic';
import { sparkStore } from '@/plugins/spark/store';
import { BlockSpec, BlockType, DS2408Block, DS2408ConnectMode } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils';
import { featureStore, WidgetFeature } from '@/store/features';

import widget from './DS2408Widget.vue';

const typeName = BlockType.DS2408;

const plugin: Plugin = {
  install(app) {

    const spec: BlockSpec<DS2408Block> = {
      id: typeName,
      discovered: true,
      generate: () => ({
        address: '',
        connected: false,
        pins: [],
        connectMode: DS2408ConnectMode.CONNECT_VALVE,
      }),
      fields: [],
    };

    const feature: WidgetFeature = {
      ...discoveredBlockFeature,
      id: typeName,
      title: 'DS2408 Chip',
      role: 'Output',
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
