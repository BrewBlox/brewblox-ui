import { matchesType } from '@/helpers/functional';
import { AutomationSpec, BlockPatchImpl } from '@/plugins/automation/types';
import { sparkStore } from '@/plugins/spark/store';

import BlockPatch from './BlockPatch.vue';

const type = 'BlockPatch';

const spec: AutomationSpec<BlockPatchImpl> = {
  type,
  title: 'Block change',
  component: BlockPatch,
  generate: () => ({
    type,
    blockId: null,
    serviceId: sparkStore.serviceIds[0],
    blockType: null,
    data: {},
  }),
  pretty: impl =>
    matchesType<BlockPatchImpl>(type, impl)
      ? `Edit block '${impl.blockId}'`
      : `Invalid data: type=${impl.type}`,
};

export default spec;
