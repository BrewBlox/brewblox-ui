import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockFieldSpec, BlockSpec } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils/components';
import { enumHint } from '@/plugins/spark/utils/formatting';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { tempQty } from '@/utils/quantity';
import {
  BlockType,
  SensorCombiFunc,
  TempSensorCombiBlock,
} from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import widget from './TempSensorCombiWidget.vue';

const type = BlockType.TempSensorCombi;

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<TempSensorCombiBlock> = {
      type,
      generate: (): TempSensorCombiBlock['data'] => ({
        sensors: [],
        combineFunc: SensorCombiFunc.SENSOR_COMBI_FUNC_AVG,
        value: tempQty(20),
      }),
      analyze: (block: TempSensorCombiBlock) => {
        const { sensors, value } = block.data;
        if (sensors.length === 0 || sensors.find((s) => s.id == null)) {
          return 'Invalid';
        }
        if (value.value == null) {
          return 'Inactive';
        }
        return 'Active';
      },
    };

    const fieldSpecs: BlockFieldSpec<TempSensorCombiBlock>[] = [
      {
        type,
        key: 'combineFunc',
        title: 'Sensor combination function',
        component: 'EnumValEdit',
        componentProps: { options: SensorCombiFunc },
        generate: () => SensorCombiFunc.SENSOR_COMBI_FUNC_AVG,
        valueHint: enumHint(SensorCombiFunc),
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
      title: 'Temp Sensor (Combined)',
      role: 'Process',
      component: blockWidgetSelector(app, widget, type),
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
