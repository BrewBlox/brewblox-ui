import { Unit } from '@/helpers/units';
import { genericBlockFeature } from '@/plugins/spark/generic';
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
  presets: [],
  changes: [],
  graphTargets: {
    value: 'Sensor value',
  },
};

const feature: WidgetFeature = {
  ...genericBlockFeature,
  id: typeName,
  title: 'OneWire Temp Sensor',
  role: 'Process',
  component: blockWidgetSelector(widget),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
  wizard: 'BlockDiscoveryWizard',
};

export default { feature, block };
