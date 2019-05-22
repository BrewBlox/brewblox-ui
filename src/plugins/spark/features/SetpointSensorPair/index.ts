import { ref } from '@/helpers/component-ref';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/types';
import { typeName } from './getters';
import form from './SetpointSensorPairForm.vue';
import widget from './SetpointSensorPairWidget.vue';

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'Sensor/Setpoint Pair',
  role: 'Process',
  widget: ref(widget),
  form: ref(form),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default feature;
