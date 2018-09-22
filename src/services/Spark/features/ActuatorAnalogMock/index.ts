import GenericBlock from '@/services/Spark/components/GenericBlock';
import widget from './ActuatorAnalogMockWidget.vue';

const feature = {
  ...GenericBlock,
  widget,
  displayName: 'Analog Actuator (Mock)',
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default feature;
