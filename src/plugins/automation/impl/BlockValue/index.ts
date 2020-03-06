import { AutomationSpec, BlockValueImpl } from '../../types';
import BlockValue from './BlockValue.vue';

const spec: AutomationSpec<BlockValueImpl> = {
  type: 'BlockValue',
  title: 'Block value',
  generate: () => ({
    type: 'BlockValue',
    blockId: '',
    serviceId: '',
    blockType: '',
    key: '',
    operator: 'eq',
    value: null,
  }),
  component: BlockValue,
};

export default spec;
