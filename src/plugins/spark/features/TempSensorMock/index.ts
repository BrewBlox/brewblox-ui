import { tempQty } from '@/helpers/bloxfield';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec, BlockType, TempSensorMockBlock } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './TempSensorMockWidget.vue';

const typeName = BlockType.TempSensorMock;

const block: BlockSpec<TempSensorMockBlock> = {
  id: typeName,
  generate: () => ({
    value: tempQty(20),
    setting: tempQty(20),
    fluctuations: [],
    connected: true,
  }),
  fields: [
    {
      key: 'setting',
      title: 'Sensor Setting',
      component: 'QuantityValEdit',
      generate: () => tempQty(20),
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
      generate: () => tempQty(20),
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
