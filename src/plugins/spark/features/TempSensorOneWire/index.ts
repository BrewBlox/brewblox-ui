import { ref } from '@/helpers/component-ref';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features/types';
import { typeName } from './getters';
import form from './TempSensorOneWireForm.vue';
import widget from './TempSensorOneWireWidget.vue';

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'OneWire Temp Sensor',
  widget: ref(widget),
  form: ref(form),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default feature;
