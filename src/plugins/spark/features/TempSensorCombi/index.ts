import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
import { sparkStore } from '@/plugins/spark/store';
import {
  BlockFieldSpec,
  BlockSpec,
  BlockType,
  SensorCombiFunc,
  TempSensorCombiBlock,
} from '@/plugins/spark/types';
import { blockWidgetSelector, enumHint } from '@/plugins/spark/utils';
import { featureStore, WidgetFeature } from '@/store/features';
import { tempQty } from '@/utils/quantity';

import widget from './TempSensorCombiWidget.vue';

const type = BlockType.TempSensorCombi;

const plugin: Plugin = {
  install(app) {
    const blockSpec: BlockSpec<TempSensorCombiBlock> = {
      type,
      generate: () => ({
        sensors: [],
        combineFunc: SensorCombiFunc.SENSOR_COMBI_FUNC_AVG,
        value: tempQty(20),
      }),
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

    sparkStore.addBlockSpec(blockSpec);
    sparkStore.addFieldSpecs(fieldSpecs);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
