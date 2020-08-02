import { bloxLink, bloxQty } from '@/helpers/bloxfield';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector, serviceTemp } from '@/plugins/spark/helpers';
import { BlockIntfType, BlockSpec, BlockType, FilterChoice, SetpointSensorPairBlock } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './SetpointSensorPairWidget.vue';

const typeName = BlockType.SetpointSensorPair;

const block: BlockSpec<SetpointSensorPairBlock> = {
  id: typeName,
  generate: (serviceId: string | null) => {
    const temp = serviceTemp(serviceId);
    return {
      sensorId: bloxLink(null, BlockIntfType.TempSensorInterface),
      storedSetting: bloxQty(null, temp),
      setting: bloxQty(null, temp),
      value: bloxQty(null, temp),
      valueUnfiltered: bloxQty(null, temp),
      resetFilter: false,
      settingEnabled: true,
      filter: FilterChoice.FILTER_15s,
      filterThreshold: bloxQty(5, 'delta_degC').to(`delta_${temp}`),
    };
  },
  fields: [
    {
      key: 'storedSetting',
      title: 'Setting',
      component: 'QuantityValEdit',
      generate: serviceId => bloxQty(20, 'degC').to(serviceTemp(serviceId)),
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
      generate: serviceId => bloxQty(5, 'delta_degC').to(`delta_${serviceTemp(serviceId)}`),
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
      generate: serviceId => bloxQty(20, 'degC').to(serviceTemp(serviceId)),
      readonly: true,
      graphed: true,
    },
    {
      key: 'value',
      title: 'Sensor',
      component: 'QuantityValEdit',
      generate: serviceId => bloxQty(20, 'degC').to(serviceTemp(serviceId)),
      readonly: true,
      graphed: true,
    },
    {
      key: 'valueUnfiltered',
      title: 'Sensor unfiltered',
      component: 'QuantityValEdit',
      generate: serviceId => bloxQty(20, 'degC').to(serviceTemp(serviceId)),
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
