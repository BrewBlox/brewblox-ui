import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features/state';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import widget from './ActuatorAnalogMockWidget.vue';

const feature: Feature = {
  ...GenericBlock,
  id: 'ActuatorAnalogMock',
  displayName: 'Analog Actuator (Mock)',
  widget: ref(widget),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default feature;
