import Vue from 'vue';
import { Feature } from '@/store/features/state';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import widget from './SetpointSensorPairWidget.vue';
import wizard from './SetpointSensorPairWizard.vue';

Vue.component(widget.name, widget);
Vue.component(wizard.name, wizard);

const feature: Feature = {
  ...GenericBlock,
  id: 'SetpointSensorPair',
  displayName: 'Sensor/Setpoint Pair',
  widget: widget.name,
  wizard: wizard.name,
  widgetSize: {
    cols: 3,
    rows: 2,
  },
};

export default feature;
