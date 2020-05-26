import { genericBlockFeature } from '@/plugins/spark/generic';
import { userUnitChoices } from '@/plugins/spark/getters';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec, TempSensorOneWireBlock } from '@/plugins/spark/types';
import { Temp } from '@/plugins/spark/units';
import { WidgetFeature } from '@/store/features';

import widget from './TempSensorOneWireWidget.vue';

const typeName = 'TempSensorOneWire';

const block: BlockSpec<TempSensorOneWireBlock> = {
  id: typeName,
  generate: () => ({
    value: new Temp(null, 'degC'),
    offset: new Temp(0, 'delta_degC'),
    address: '',
  }),
  fields: [
    {
      key: 'value',
      title: 'Sensor value',
      component: 'UnitValEdit',
      componentProps: { units: userUnitChoices.Temp },
      generate: () => new Temp(20, 'degC'),
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
