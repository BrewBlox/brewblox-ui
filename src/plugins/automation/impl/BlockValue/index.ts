import { sparkStore } from '@/plugins/spark/store';

import { AutomationSpec, BlockValueImpl } from '../../types';
import BlockValue from './BlockValue.vue';

const spec: AutomationSpec<BlockValueImpl> = {
  type: 'BlockValue',
  title: 'Block value',
  generate: () => ({
    type: 'BlockValue',
    blockId: null,
    serviceId: sparkStore.serviceIds[0],
    blockType: null,
    key: null,
    operator: 'eq',
    value: null,
  }),
  component: BlockValue,
};

export default spec;
