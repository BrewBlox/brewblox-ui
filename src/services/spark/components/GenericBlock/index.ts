import widget from './GenericBlock.vue';

import { blockById } from '../../store/getters';

const feature = {
  widget,
  validator: (store: any, config: any) => blockById(store, config.blockId) !== undefined,
  widgetSize: {
    cols: 4,
    rows: 4,
  },
};

export default feature;
