import widget from './GenericBlock.vue';

import { blockById } from '../../store/getters';

const validator = (store: any, config: any) =>
  blockById(store, config.serviceId, config.blockId) !== undefined;

const feature = {
  widget,
  validator,
  widgetSize: {
    cols: 4,
    rows: 4,
  },
};

export default feature;
