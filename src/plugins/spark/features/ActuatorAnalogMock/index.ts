import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features/state';
import { typeName } from './getters';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import widget from './ActuatorAnalogMockWidget.vue';
import form from './ActuatorAnalogMockForm.vue';

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
