import Vue from 'vue';
import { Feature } from '@/store/features/state';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import widget from './PidWidget.vue';

Vue.component(widget.name, widget);

const feature: Feature = {
  ...GenericBlock,
  id: 'Pid',
  displayName: 'PID',
  widget: widget.name,
  widgetSize: {
    cols: 5,
    rows: 6,
  },
};

export default feature;
