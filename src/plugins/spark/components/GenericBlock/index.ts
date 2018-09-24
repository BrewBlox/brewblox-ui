import Vue from 'vue';
import { Feature } from '@/store/features/state';
import widget from './GenericBlock.vue';

import { blockById } from '../../store/getters';

Vue.component(widget.name, widget);

const validator = (store: any, config: any) =>
  blockById(store, config.serviceId, config.blockId) !== undefined;

const feature: Partial<Feature> = {
  widget: widget.name,
  validator,
  widgetSize: {
    cols: 4,
    rows: 4,
  },
};

export default feature;
