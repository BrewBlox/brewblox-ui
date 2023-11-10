import { BlockType, TempSensorMockBlock } from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockFieldSpec, BlockSpec } from '@/plugins/spark/types';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import { tempQty } from '@/utils/quantity';
import widget from './TempSensorMockWidget.vue';

const type = BlockType.TempSensorMock;
const title = 'Temp Sensor (Mock)';

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<TempSensorMockBlock> = {
      type,
      title,
      generate: (): TempSensorMockBlock['data'] => ({
        value: tempQty(20),
        setting: tempQty(20),
        fluctuations: [],
        connected: true,
      }),
      analyze: (block: TempSensorMockBlock) => {
        if (!block.data.connected) {
          return 'Invalid';
        }
        return 'Active';
      },
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
      title,
      role: 'Process',
      component: cref(app, widget),
      widgetSize: {
        cols: 4,
        rows: 3,
      },
    };

    specStore.addBlockSpec(blockSpec);
    specStore.addFieldSpecs(fieldSpecs);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
