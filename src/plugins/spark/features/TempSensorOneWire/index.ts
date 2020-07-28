import { Temp } from '@/plugins/spark/bloxfield';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector, serviceTemp } from '@/plugins/spark/helpers';
import { BlockSpec, TempSensorOneWireBlock } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './TempSensorOneWireWidget.vue';

const typeName = 'TempSensorOneWire';

const block: BlockSpec<TempSensorOneWireBlock> = {
  id: typeName,
  generate: serviceId => {
    const temp = serviceTemp(serviceId);
    return {
      value: new Temp(20, 'degC').convert(temp),
      offset: new Temp(0, `delta_${temp}`),
      address: '',
    };
  },
  fields: [
    {
      key: 'value',
      title: 'Sensor value',
      component: 'UnitValEdit',
      generate: serviceId => new Temp(20, 'degC').convert(serviceTemp(serviceId)),
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
