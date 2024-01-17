import { BlockType, TempSensorOneWireBlock } from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import { discoveredBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockFieldSpec, BlockSpec } from '@/plugins/spark/types';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import { bloxLink } from '@/utils/link';
import { deltaTempQty, tempQty } from '@/utils/quantity';
import widget from './TempSensorOneWireWidget.vue';

const type = BlockType.TempSensorOneWire;
const title = 'OneWire Temp Sensor';

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<TempSensorOneWireBlock> = {
      type,
      title,
      hasRelations: true,
      generate: (): TempSensorOneWireBlock['data'] => ({
        value: tempQty(20),
        offset: deltaTempQty(0),
        address: '',
        oneWireBusId: bloxLink(null),
      }),
      analyze: (block: TempSensorOneWireBlock) => {
        const { value, address, oneWireBusId } = block.data;
        if (!address || oneWireBusId.id == null) {
          return 'Invalid';
        }
        if (value.value == null) {
          return 'Inactive';
        }
        return 'Active';
      },
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
      title,
      role: 'Process',
      component: cref(app, widget),
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
