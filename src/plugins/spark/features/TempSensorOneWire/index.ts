import { discoveredBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockFieldSpec, BlockSpec } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils/components';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { bloxLink } from '@/utils/link';
import { deltaTempQty, tempQty } from '@/utils/quantity';
import { BlockType, TempSensorOneWireBlock } from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import widget from './TempSensorOneWireWidget.vue';

const type = BlockType.TempSensorOneWire;

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<TempSensorOneWireBlock> = {
      type,
      generate: (): TempSensorOneWireBlock['data'] => ({
        value: tempQty(20),
        offset: deltaTempQty(0),
        address: '',
        oneWireBusId: bloxLink(null),
      }),
    };

    const fieldSpecs: BlockFieldSpec<TempSensorOneWireBlock>[] = [
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
      ...discoveredBlockFeature,
      id: type,
      title: 'OneWire Temp Sensor',
      role: 'Process',
      component: blockWidgetSelector(app, widget, type),
      widgetSize: {
        cols: 4,
        rows: 2,
      },
    };

    specStore.addBlockSpec(blockSpec);
    specStore.addFieldSpecs(fieldSpecs);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
