import Vue from 'vue';
import { Feature } from '@/store/features/state';
import widget from './MetricsWidget.vue';
// import wizard from './MetricsWizard.vue';

Vue.component(widget.name, widget);

const feature: Feature = {
  id: 'Metrics',
  displayName: 'Metrics',
  widget: widget.name,
  validator: () => true,
};

export default feature;
