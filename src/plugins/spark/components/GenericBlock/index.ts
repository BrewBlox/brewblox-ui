import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features/state';
import widget from './GenericBlock.vue';

import { blockById } from '@/plugins/spark/store/getters';

const validator = (store: any, config: any) =>
  blockById(store, config.serviceId, config.blockId) !== undefined;

const feature: Partial<Feature> = {
  validator,
  widget: ref(widget),
  widgetSize: {
    cols: 4,
    rows: 4,
  },
};

export default feature;
