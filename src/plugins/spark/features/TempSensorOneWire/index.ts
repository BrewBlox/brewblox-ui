import { ref } from '@/helpers/component-ref';
import { Unit } from '@/helpers/units';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features';

import { BlockSpec } from '../../types';
import form from './TempSensorOneWireForm.vue';
import widget from './TempSensorOneWireWidget.vue';
import { typeName } from './getters';
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
};

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'OneWire Temp Sensor',
  role: 'Process',
  widget: ref(widget),
  form: ref(form),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default { feature, block };
