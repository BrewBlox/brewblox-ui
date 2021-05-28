import { Plugin } from 'vue';

import { systemBlockFeature } from '@/plugins/spark/generic';
import { sparkStore } from '@/plugins/spark/store';
import { BlockSpec, BlockType, Spark3PinsBlock } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils';
import { featureStore, WidgetFeature } from '@/store/features';

import widget from './Spark3PinsWidget.vue';

const typeName = BlockType.Spark3Pins;

const plugin: Plugin = {
  install(app) {

    const spec: BlockSpec<Spark3PinsBlock> = {
      id: typeName,
      systemObject: true,
      generate: () => ({
        pins: [],
        enableIoSupply5V: false,
        enableIoSupply12V: false,
        soundAlarm: false,
        voltage5: 0,
        voltage12: 0,
      }),
      fieldSpecs: [
        {
          key: 'soundAlarm',
          title: 'Alarm sound',
          component: 'BoolValEdit',
          generate: () => false,
        },
        {
          key: 'enableIoSupply5V',
          title: 'Enable 5V power supply',
          component: 'BoolValEdit',
          generate: () => true,
        },
        {
          key: 'enableIoSupply12V',
          title: 'Enable 12V power supply',
          component: 'BoolValEdit',
          generate: () => true,
        },
        {
          key: 'voltage5',
          title: 'Measured 5V power supply',
          component: 'NumberValEdit',
          generate: () => 5,
          readonly: true,
        },
        {
          key: 'voltage12',
          title: 'Measured 12V power supply',
          component: 'NumberValEdit',
          generate: () => 12,
          readonly: true,
        },
      ],
    };

    const feature: WidgetFeature = {
      ...systemBlockFeature,
      id: typeName,
      title: 'Spark 3 Pins',
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
