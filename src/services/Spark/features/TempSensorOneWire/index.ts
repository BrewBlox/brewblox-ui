import GenericBlock from '@/services/Spark/components/GenericBlock';
import widget from './TempSensorOneWireWidget.vue';

const feature = {
  ...GenericBlock,
  widget,
  displayName: 'Onewire Temperature Sensor',
  widgetSize: {
    cols: 4,
    rows: 3,
  },
};

export default feature;
