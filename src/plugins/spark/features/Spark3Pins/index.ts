import { Plugin } from 'vue';

import { systemBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import {
  BlockFieldSpec,
  BlockSpec,
  BlockType,
  Spark3PinsBlock,
} from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils/components';
import { WidgetFeature, useFeatureStore } from '@/store/features';

import widget from './Spark3PinsWidget.vue';

const type = BlockType.Spark3Pins;

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<Spark3PinsBlock> = {
      type,
      generate: () => ({
        channels: [],
        enableIoSupply5V: false,
        enableIoSupply12V: false,
        soundAlarm: false,
        voltage5: 0,
        voltage12: 0,
      }),
    };

    const fieldSpecs: BlockFieldSpec<Spark3PinsBlock>[] = [
      {
        type,
        key: 'soundAlarm',
        title: 'Alarm sound',
        component: 'BoolValEdit',
        generate: () => false,
      },
      {
        type,
        key: 'enableIoSupply5V',
        title: 'Enable 5V power supply',
        component: 'BoolValEdit',
        generate: () => true,
      },
      {
        type,
        key: 'enableIoSupply12V',
        title: 'Enable 12V power supply',
        component: 'BoolValEdit',
        generate: () => true,
      },
      {
        type,
        key: 'voltage5',
        title: 'Measured 5V power supply',
        component: 'NumberValEdit',
        generate: () => 5,
        readonly: true,
      },
      {
        type,
        key: 'voltage12',
        title: 'Measured 12V power supply',
        component: 'NumberValEdit',
        generate: () => 12,
        readonly: true,
      },
    ];

    const feature: WidgetFeature = {
      ...systemBlockFeature,
      id: type,
      title: 'Spark 3 Pins',
      role: 'Output',
      component: blockWidgetSelector(app, widget, type),
      widgetSize: {
        cols: 4,
        rows: 4,
      },
    };

    specStore.addBlockSpec(blockSpec);
    specStore.addFieldSpecs(fieldSpecs);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
