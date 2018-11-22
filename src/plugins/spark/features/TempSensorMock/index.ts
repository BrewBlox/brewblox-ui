import { ref } from '@/helpers/component-ref';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features/state';
import { typeName } from './getters';
import form from './TempSensorMockForm.vue';
import widget from './TempSensorMockWidget.vue';

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'Mock Temperature Sensor',
  widget: ref(widget),
  form: ref(form),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default feature;
