import GenericBlock from '@/services/Spark/components/GenericBlock';
import widget from './SensorSetPointPairWidget.vue';
import wizard from './SensorSetPointPairWizard.vue';

const feature = {
  ...GenericBlock,
  widget,
  wizard,
  displayName: 'Sensor/Setpoint Pair',
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default feature;
