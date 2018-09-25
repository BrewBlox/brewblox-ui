import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features/state';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import widget from './ActuatorAnalogMockWidget.vue';
import { typeName } from './getters';

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'Analog Actuator (Mock)',
  widget: ref(widget),
  widgetSize: {
    cols: 3,
    rows: 2,
  },
};

export default feature;
