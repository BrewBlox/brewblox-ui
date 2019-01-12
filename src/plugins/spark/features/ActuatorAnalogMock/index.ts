import { ref } from '@/helpers/component-ref';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features/state';
import form from './ActuatorAnalogMockForm.vue';
import widget from './ActuatorAnalogMockWidget.vue';
import { typeName } from './getters';

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'Analog Actuator (Mock)',
  widget: ref(widget),
  form: ref(form),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default feature;
