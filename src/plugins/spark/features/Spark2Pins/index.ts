import { Plugin } from 'vue';

import { systemBlockFeature } from '@/plugins/spark/generic';
import { sparkStore } from '@/plugins/spark/store';
import { BlockSpec, BlockType, Spark2Hardware, Spark2PinsBlock } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils';
import { featureStore, WidgetFeature } from '@/store/features';

import widget from './Spark2PinsWidget.vue';

const typeName = BlockType.Spark2Pins;

const plugin: Plugin = {
  install(app) {

    const spec: BlockSpec<Spark2PinsBlock> = {
      id: typeName,
      systemObject: true,
      generate: () => ({
        pins: [],
        soundAlarm: false,
        hardware: Spark2Hardware.HW_UNKNOWN,
      }),
      fieldSpecs: [],
    };

    const feature: WidgetFeature = {
      ...systemBlockFeature,
      id: typeName,
      title: 'Spark 2 Pins',
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
