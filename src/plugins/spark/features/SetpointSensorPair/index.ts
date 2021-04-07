import { bloxLink, deltaTempQty, tempQty } from '@/helpers/bloxfield';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockIntfType, BlockSpec, BlockType, FilterChoice, SetpointSensorPairBlock } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './SetpointSensorPairWidget.vue';

const typeName = BlockType.SetpointSensorPair;

const block: BlockSpec<SetpointSensorPairBlock> = {
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
  fields: [
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
  component: blockWidgetSelector(widget, typeName),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default { feature, block };
