import { BlockType, TempSensorMockFluctuatingBlock } from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockFieldSpec, BlockSpec } from '@/plugins/spark/types';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { tempQty } from '@/utils/quantity';

const type = BlockType.TempSensorMockFluctuating;
const title = 'Temp Sensor (Mock, fluctuating)';

const plugin: Plugin = {
  install() {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<TempSensorMockFluctuatingBlock> = {
      type,
      title,
      hasRelations: true,
      simulatorOnly: true,
      generate: (): TempSensorMockFluctuatingBlock['data'] => ({
        value: tempQty(20),
        setting: tempQty(20),
        fluctuations: [],
        connected: true,
      }),
      analyze: (block: TempSensorMockFluctuatingBlock) => {
        if (!block.data.connected) {
          return 'Invalid';
        }
        return 'Active';
      },
    };

    const fieldSpecs: BlockFieldSpec<TempSensorMockFluctuatingBlock>[] = [
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
      // The TempSensorMock feature registers the widget both mocks share
      component: 'TempSensorMockWidget',
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
