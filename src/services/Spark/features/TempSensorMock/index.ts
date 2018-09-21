import GenericBlock from '@/services/Spark/components/GenericBlock';
import widget from './TempSensorMockWidget.vue';

const feature = {
  ...GenericBlock,
  widget,
  displayName: 'Mock Temperature Sensor',
  widgetSize: {
    cols: 4,
    rows: 3,
  },
};

export default feature;
