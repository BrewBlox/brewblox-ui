import { AutomationSpec, BlockPatchImpl } from '../../types';
import BlockPatch from './BlockPatch.vue';

const spec: AutomationSpec<BlockPatchImpl> = {
  type: 'BlockPatch',
  title: 'Block change',
  generate: () => ({
    type: 'BlockPatch',
    blockId: '',
    serviceId: '',
    blockType: '',
    data: {},
  }),
  component: BlockPatch,
};

export default spec;
