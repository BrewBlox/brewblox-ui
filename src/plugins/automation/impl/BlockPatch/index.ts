import { sparkStore } from '@/plugins/spark/store';

import { AutomationSpec, BlockPatchImpl } from '../../types';
import BlockPatch from './BlockPatch.vue';

const spec: AutomationSpec<BlockPatchImpl> = {
  type: 'BlockPatch',
  title: 'Block change',
  generate: () => ({
    type: 'BlockPatch',
    blockId: null,
    serviceId: sparkStore.serviceIds[0],
    blockType: null,
    data: {},
  }),
  component: BlockPatch,
};

export default spec;
