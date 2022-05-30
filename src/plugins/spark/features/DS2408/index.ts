import { Plugin } from 'vue';

import { discoveredBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import {
  BlockSpec,
  BlockType,
  DS2408Block,
  DS2408ConnectMode,
} from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils';
import { WidgetFeature, useFeatureStore } from '@/store/features';

import widget from './DS2408Widget.vue';

const type = BlockType.DS2408;

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<DS2408Block> = {
      type,
      generate: () => ({
        oneWireBusId: 0,
        address: '',
        connected: false,
        channels: [],
        connectMode: DS2408ConnectMode.CONNECT_VALVE,
      }),
    };

    const feature: WidgetFeature = {
      ...discoveredBlockFeature,
      id: type,
      title: 'DS2408 Chip',
      role: 'Output',
      component: blockWidgetSelector(app, widget, type),
      widgetSize: {
        cols: 4,
        rows: 3,
      },
    };

    specStore.addBlockSpec(blockSpec);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
