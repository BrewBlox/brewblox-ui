import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
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
      fields: [],
    };

    const feature: WidgetFeature = {
      ...genericBlockFeature,
      id: typeName,
      title: 'Spark 2 Pins',
      role: 'Output',
      component: blockWidgetSelector(app, widget, typeName),
      widgetSize: {
        cols: 4,
        rows: 4,
      },
      // System objects can't be created or deleted
      wizard: false,
      removeActions: undefined,
    };

    sparkStore.registerSpec(spec);
    featureStore.registerWidget(feature);
  },
};

export default plugin;
