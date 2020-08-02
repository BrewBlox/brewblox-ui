import { bloxQty } from '@/helpers/bloxfield';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector, serviceTemp } from '@/plugins/spark/helpers';
import { BlockSpec, BlockType, TempSensorMockBlock } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './TempSensorMockWidget.vue';

const typeName = BlockType.TempSensorMock;

const block: BlockSpec<TempSensorMockBlock> = {
  id: typeName,
  generate: serviceId => {
    const temp = serviceTemp(serviceId);
    return {
      value: bloxQty(20, 'degC').to(temp),
      setting: bloxQty(20, 'degC').to(temp),
      fluctuations: [],
      connected: true,
    };
  },
  fields: [
    {
      key: 'setting',
      title: 'Sensor Setting',
      component: 'QuantityValEdit',
      generate: serviceId => bloxQty(20, 'degC').to(serviceTemp(serviceId)),
    },
    {
      key: 'connected',
      title: 'Connected',
      component: 'BoolValEdit',
      generate: () => true,
    },
    {
      key: 'value',
      title: 'Sensor value',
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
  title: 'Temp Sensor (Mock)',
  role: 'Process',
  component: blockWidgetSelector(widget, typeName),
  widgetSize: {
    cols: 4,
    rows: 3,
  },
};

export default { feature, block };
