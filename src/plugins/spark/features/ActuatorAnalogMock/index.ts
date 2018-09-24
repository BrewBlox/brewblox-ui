import Vue from 'vue';
import { Feature } from '@/store/features/state';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import widget from './ActuatorAnalogMockWidget.vue';

Vue.component(widget.name, widget);

const feature: Feature = {
  ...GenericBlock,
  id: 'ActuatorAnalogMock',
  displayName: 'Analog Actuator (Mock)',
  widget: widget.name,
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default feature;
