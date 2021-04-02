import { deltaTempQty, tempQty } from '@/helpers/bloxfield';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec, BlockType, TempSensorOneWireBlock } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './TempSensorOneWireWidget.vue';

const typeName = BlockType.TempSensorOneWire;

const block: BlockSpec<TempSensorOneWireBlock> = {
  id: typeName,
  discovered: true,
  generate: () => ({
    value: tempQty(20),
    offset: deltaTempQty(0),
    address: '',
  }),
  fields: [
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
  title: 'OneWire Temp Sensor',
  role: 'Process',
  component: blockWidgetSelector(widget, typeName),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
  wizard: 'BlockDiscoveryWizard',
};

export default { feature, block };
