import { Unit } from '@/helpers/units';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { userUnitChoices } from '@/plugins/spark/getters';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import { typeName } from './getters';
import widget from './TempSensorOneWireWidget.vue';
import { TempSensorOneWireData } from './types';

const block: BlockSpec = {
  id: typeName,
  generate: (): TempSensorOneWireData => ({
    value: new Unit(null, 'degC'),
    offset: new Unit(0, 'delta_degC'),
    address: '',
  }),
  fields: [
    {
      key: 'value',
      title: 'Sensor value',
      component: 'UnitValEdit',
      componentProps: { units: userUnitChoices.Temp },
      generate: () => new Unit(20, 'degC'),
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
