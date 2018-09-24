import Vue from 'vue';
import { Feature } from '@/store/features/state';
import widget from './ProcessView.vue';

Vue.component(widget.name, widget);

const feature: Feature = {
  id: 'ProcessView',
  displayName: 'Process View',
  widget: widget.name,
  validator: (store: any, config: any) => true,
};

export default feature;
