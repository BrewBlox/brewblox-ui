import { matchesType } from '@/helpers/functional';
import { AutomationSpec, BlockValueImpl } from '@/plugins/automation/types';
import { sparkStore } from '@/plugins/spark/store';

import BlockValue from './BlockValue.vue';

const type = 'BlockValue';
const spec: AutomationSpec<BlockValueImpl> = {
  type,
  title: 'Block value',
  component: BlockValue,
  generate: () => ({
    type,
    blockId: null,
    serviceId: sparkStore.serviceIds[0] ?? null,
    blockType: null,
    key: null,
    operator: 'eq',
    value: null,
  }),
  pretty: impl =>
    matchesType<BlockValueImpl>(type, impl)
      ? `Assert '${impl.key}' value in block '${impl.blockId}'`
      : `Invalid data: type=${impl.type}`,
};

export default spec;
