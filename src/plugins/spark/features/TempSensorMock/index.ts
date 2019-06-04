import { ref } from '@/helpers/component-ref';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features';

import form from './TempSensorMockForm.vue';
import widget from './TempSensorMockWidget.vue';
import { typeName } from './getters';

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
