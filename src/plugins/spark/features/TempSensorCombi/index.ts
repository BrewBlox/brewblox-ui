import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
import { sparkStore } from '@/plugins/spark/store';
import { BlockSpec, BlockType, SensorCombiFunc, TempSensorCombiBlock } from '@/plugins/spark/types';
import { blockWidgetSelector, enumHint } from '@/plugins/spark/utils';
import { featureStore, WidgetFeature } from '@/store/features';
import { tempQty } from '@/utils/bloxfield';

import widget from './TempSensorCombiWidget.vue';

const typeName = BlockType.TempSensorCombi;

const plugin: Plugin = {
  install(app) {

    const spec: BlockSpec<TempSensorCombiBlock> = {
      id: typeName,
      generate: () => ({
        sensors: [],
        combineFunc: SensorCombiFunc.SENSOR_COMBI_FUNC_AVG,
        value: tempQty(20),
      }),
      fields: [
        {
          key: 'combineFunc',
          title: 'Sensor combination function',
          component: 'EnumValEdit',
          componentProps: { options: SensorCombiFunc },
          generate: () => SensorCombiFunc.SENSOR_COMBI_FUNC_AVG,
          valueHint: enumHint(SensorCombiFunc),
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
      title: 'Temp Sensor (Combined)',
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
