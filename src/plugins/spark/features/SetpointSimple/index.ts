import Vue from 'vue';
import { Feature } from '@/store/features/state';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import widget from './SetpointSimpleWidget.vue';

Vue.component(widget.name, widget);

const feature: Feature = {
  ...GenericBlock,
  id: 'SetpointSimple',
  displayName: 'Basic Setpoint',
  widget: widget.name,
  widgetSize: {
    cols: 3,
    rows: 2,
  },
};

export default feature;
