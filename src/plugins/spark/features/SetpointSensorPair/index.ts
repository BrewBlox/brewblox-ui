import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
import { sparkStore } from '@/plugins/spark/store';
import { BlockIntfType, BlockSpec, BlockType, FilterChoice, SetpointSensorPairBlock } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils';
import { featureStore, WidgetFeature } from '@/store/features';
import { bloxLink, deltaTempQty, tempQty } from '@/utils/bloxfield';

import widget from './SetpointSensorPairWidget.vue';

const typeName = BlockType.SetpointSensorPair;

const plugin: Plugin = {
  install(app) {
    const spec: BlockSpec<SetpointSensorPairBlock> = {
      id: typeName,
      generate: () => ({
        sensorId: bloxLink(null, BlockIntfType.TempSensorInterface),
        storedSetting: tempQty(20),
        setting: tempQty(null),
        value: tempQty(null),
        valueUnfiltered: tempQty(null),
        resetFilter: false,
        settingEnabled: true,
        filter: FilterChoice.FILTER_15s,
        filterThreshold: deltaTempQty(5),
      }),
      fieldSpecs: [
        {
          key: 'storedSetting',
          title: 'Setting',
          component: 'QuantityValEdit',
          generate: () => tempQty(20),
        },
        {
          key: 'settingEnabled',
          title: 'Enabled',
          component: 'BoolValEdit',
          generate: () => true,
        },
        {
          key: 'filterThreshold',
          title: 'Fast step threshold',
          component: 'QuantityValEdit',
          generate: () => deltaTempQty(5),
        },
        {
          key: 'sensorId',
          title: 'Linked Sensor',
          component: 'LinkValEdit',
          generate: () => bloxLink(null, BlockIntfType.TempSensorInterface),
        },
        {
          key: 'setting',
          title: 'Setting (actual)',
          component: 'QuantityValEdit',
          generate: () => tempQty(20),
          readonly: true,
          graphed: true,
        },
        {
          key: 'value',
          title: 'Sensor',
          component: 'QuantityValEdit',
          generate: () => tempQty(20),
          readonly: true,
          graphed: true,
        },
        {
          key: 'valueUnfiltered',
          title: 'Sensor unfiltered',
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
      title: 'Setpoint',
      role: 'Process',
      component: blockWidgetSelector(app, widget, typeName),
      widgetSize: {
        cols: 4,
        rows: 2,
      },
    };

    sparkStore.addBlockSpec(spec);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
