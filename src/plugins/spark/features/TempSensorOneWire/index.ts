import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
import { sparkStore } from '@/plugins/spark/store';
import { BlockSpec, BlockType, TempSensorOneWireBlock } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils';
import { featureStore, WidgetFeature } from '@/store/features';
import { deltaTempQty, tempQty } from '@/utils/bloxfield';

import widget from './TempSensorOneWireWidget.vue';

const typeName = BlockType.TempSensorOneWire;

const plugin: Plugin = {
  install(app) {

    const spec: BlockSpec<TempSensorOneWireBlock> = {
      id: typeName,
      discovered: true,
      generate: () => ({
        value: tempQty(20),
        offset: deltaTempQty(0),
        address: '',
      }),
      fields: [
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
      title: 'OneWire Temp Sensor',
      role: 'Process',
      component: blockWidgetSelector(app, widget, typeName),
      widgetSize: {
        cols: 4,
        rows: 2,
      },
      wizard: 'BlockDiscoveryWizard',
    };

    sparkStore.addBlockSpec(spec);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
