import { matchesType } from '@/helpers/functional';
import { AutomationSpec, BlockValueImpl } from '@/plugins/automation/types';
import { sparkStore } from '@/plugins/spark/store';

import BlockValue from './BlockValue.vue';
import { operatorSymbols } from './helpers';

const operator = (impl: BlockValueImpl): string =>
  operatorSymbols.find(op => op.value === impl.operator)?.label ?? '???';

const type = 'BlockValue';
const spec: AutomationSpec<BlockValueImpl> = {
  type,
  title: 'Block value (Deprecated)',
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
      ? `${impl.blockId} '${impl.key}' ${operator(impl)} ${impl.value}`
      : `Invalid data: type=${impl.type}`,
};

export default spec;
