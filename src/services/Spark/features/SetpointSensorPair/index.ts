import GenericBlock from '@/services/Spark/components/GenericBlock';
import widget from './SetpointSensorPairWidget.vue';
import wizard from './SetpointSensorPairWizard.vue';

const feature = {
  ...GenericBlock,
  widget,
  wizard,
  displayName: 'Sensor/Setpoint Pair',
  widgetSize: {
    cols: 3,
    rows: 2,
  },
};

export default feature;
