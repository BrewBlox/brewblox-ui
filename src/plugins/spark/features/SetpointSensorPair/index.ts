import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features/state';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import widget from './SetpointSensorPairWidget.vue';
import wizard from './SetpointSensorPairWizard.vue';
import { typeName } from './getters';

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'Sensor/Setpoint Pair',
  widget: ref(widget),
  wizard: ref(wizard),
  widgetSize: {
    cols: 3,
    rows: 2,
  },
};

export default feature;
