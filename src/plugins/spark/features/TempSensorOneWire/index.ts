import { ref } from '@/helpers/component-ref';
import { Unit } from '@/helpers/units';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features';

import { BlockSpec } from '../../types';
import { typeName } from './getters';
import form from './TempSensorOneWireForm.vue';
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

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'OneWire Temp Sensor',
  role: 'Process',
  widgetComponent: ref(widget),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default { feature, block };
