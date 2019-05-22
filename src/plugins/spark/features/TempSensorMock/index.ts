import { ref } from '@/helpers/component-ref';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/types';
import { typeName } from './getters';
import form from './TempSensorMockForm.vue';
import widget from './TempSensorMockWidget.vue';

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'Temp Sensor (Mock)',
  role: 'Process',
  widget: ref(widget),
  form: ref(form),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default feature;
