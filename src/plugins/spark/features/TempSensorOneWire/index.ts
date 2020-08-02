import { bloxQty } from '@/helpers/bloxfield';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector, serviceTemp } from '@/plugins/spark/helpers';
import { BlockSpec, BlockType, TempSensorOneWireBlock } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './TempSensorOneWireWidget.vue';

const typeName = BlockType.TempSensorOneWire;

const block: BlockSpec<TempSensorOneWireBlock> = {
  id: typeName,
  generate: serviceId => {
    const temp = serviceTemp(serviceId);
    return {
      value: bloxQty(20, 'degC').to(temp),
      offset: bloxQty(0, `delta_${temp}`),
      address: '',
    };
  },
  fields: [
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
