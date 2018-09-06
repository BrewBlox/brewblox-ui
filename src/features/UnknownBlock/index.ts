import widget from './UnknownBlockWidget.vue';

import { blockById } from '@/store/blocks/getters';

const feature = {
  widget,
  validator: (store: any, config: any) => blockById(store, config.blockId) !== undefined,
};

export default feature;
