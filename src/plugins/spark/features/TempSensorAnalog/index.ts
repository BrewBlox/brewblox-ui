import {
  AnalogSensorType,
  BlockIntfType,
  BlockType,
  TempSensorAnalogBlock,
  TempSensorAnalogSpec,
  TempSensorAnalogType,
} from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockFieldSpec, BlockSpec } from '@/plugins/spark/types';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import { bloxLink } from '@/utils/link';
import { deltaTempQty, tempQty } from '@/utils/quantity';
import widget from './TempSensorAnalogWidget.vue';

const type = BlockType.TempSensorAnalog;
const title = 'Analog Temp Sensor';

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<TempSensorAnalogBlock> = {
      type,
      title,
      hasRelations: true,
      generate: (): TempSensorAnalogBlock['data'] => ({
        value: tempQty(20),
        offset: deltaTempQty(0),
        sensorType: TempSensorAnalogType.TEMP_SENSOR_TYPE_NOT_SET,
        analogDevice: bloxLink(null, BlockIntfType.AnalogArrayInterface),
        analogChannel: 0,
        detected: AnalogSensorType.ANALOG_SENSOR_TYPE_NONE,
        spec: TempSensorAnalogSpec.SPEC_NOT_SET,
      }),
      analyze: (block: TempSensorAnalogBlock) => {
        const { value, analogDevice, analogChannel } = block.data;
        if (analogChannel == 0 || analogDevice.id == null) {
          return 'Invalid';
        }
        if (value.value == null) {
          return 'Inactive';
        }
        return 'Active';
      },
    };

    const fieldSpecs: BlockFieldSpec<TempSensorAnalogBlock>[] = [
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
        rows: 2,
      },
      experimental: true,
    };

    specStore.addBlockSpec(blockSpec);
    specStore.addFieldSpecs(fieldSpecs);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
