import Vue from 'vue';
import { Feature } from '@/store/features/state';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import widget from './TempSensorMockWidget.vue';

Vue.component(widget.name, widget);

const feature: Feature = {
  ...GenericBlock,
  id: 'TempSensorMock',
  displayName: 'Mock Temperature Sensor',
  widget: widget.name,
  widgetSize: {
    cols: 4,
    rows: 3,
  },
};

export default feature;
