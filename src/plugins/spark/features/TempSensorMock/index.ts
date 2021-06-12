import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
import { sparkStore } from '@/plugins/spark/store';
import { BlockFieldSpec, BlockSpec, BlockType, TempSensorMockBlock } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils';
import { featureStore, WidgetFeature } from '@/store/features';
import { tempQty } from '@/utils/quantity';

import widget from './TempSensorMockWidget.vue';

const type = BlockType.TempSensorMock;

const plugin: Plugin = {
  install(app) {

    const blockSpec: BlockSpec<TempSensorMockBlock> = {
      type,
      generate: () => ({
        value: tempQty(20),
        setting: tempQty(20),
        fluctuations: [],
        connected: true,
      }),
    };

    const fieldSpecs: BlockFieldSpec<TempSensorMockBlock>[] = [
      {
        type,
        key: 'setting',
        title: 'Sensor Setting',
        component: 'QuantityValEdit',
        generate: () => tempQty(20),
      },
      {
        type,
        key: 'connected',
        title: 'Connected',
        component: 'BoolValEdit',
        generate: () => true,
      },
      {
        type,
        key: 'value',
        title: 'Sensor value',
        component: 'QuantityValEdit',
        generate: () => tempQty(20),
        readonly: true,
        graphed: true,
      },
    ];

    const feature: WidgetFeature = {
      ...genericBlockFeature,
      id: type,
      title: 'Temp Sensor (Mock)',
      role: 'Process',
      component: blockWidgetSelector(app, widget, type),
      widgetSize: {
        cols: 4,
        rows: 3,
      },
    };

    sparkStore.addBlockSpec(blockSpec);
    sparkStore.addFieldSpecs(fieldSpecs);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
