import { Plugin } from 'vue';

import { systemBlockFeature } from '@/plugins/spark/generic';
import { sparkStore } from '@/plugins/spark/store';
import {
  BlockSpec,
  BlockType,
  Spark2Hardware,
  Spark2PinsBlock,
} from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils';
import { featureStore, WidgetFeature } from '@/store/features';

import widget from './Spark2PinsWidget.vue';

const type = BlockType.Spark2Pins;

const plugin: Plugin = {
  install(app) {
    const blockSpec: BlockSpec<Spark2PinsBlock> = {
      type,
      generate: () => ({
        channels: [],
        soundAlarm: false,
        hardware: Spark2Hardware.HW_UNKNOWN,
      }),
    };

    const feature: WidgetFeature = {
      ...systemBlockFeature,
      id: type,
      title: 'Spark 2 Pins',
      role: 'Output',
      component: blockWidgetSelector(app, widget, type),
      widgetSize: {
        cols: 4,
        rows: 4,
      },
    };

    sparkStore.addBlockSpec(blockSpec);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
