import GenericBlock from '@/services/Spark/components/GenericBlock';
import widget from './SetpointSimpleWidget.vue';

const feature = {
  ...GenericBlock,
  widget,
  displayName: 'Basic Setpoint',
  widgetSize: {
    cols: 3,
    rows: 2,
  },
};

export default feature;
