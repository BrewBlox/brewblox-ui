import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
import { sparkStore } from '@/plugins/spark/store';
import { BlockSpec, BlockType, TempSensorMockBlock } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils';
import { featureStore, WidgetFeature } from '@/store/features';
import { tempQty } from '@/utils/bloxfield';

import widget from './TempSensorMockWidget.vue';

const typeName = BlockType.TempSensorMock;

const plugin: Plugin = {
  install(app) {

    const spec: BlockSpec<TempSensorMockBlock> = {
      id: typeName,
      generate: () => ({
        value: tempQty(20),
        setting: tempQty(20),
        fluctuations: [],
        connected: true,
      }),
      fieldSpecs: [
        {
          key: 'setting',
          title: 'Sensor Setting',
          component: 'QuantityValEdit',
          generate: () => tempQty(20),
        },
        {
          key: 'connected',
          title: 'Connected',
          component: 'BoolValEdit',
          generate: () => true,
        },
        {
          key: 'value',
          title: 'Sensor value',
          component: 'QuantityValEdit',
          generate: () => tempQty(20),
          readonly: true,
          graphed: true,
        },
      ],
    };

    const feature: WidgetFeature = {
      ...genericBlockFeature,
      id: typeName,
      title: 'Temp Sensor (Mock)',
      role: 'Process',
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
