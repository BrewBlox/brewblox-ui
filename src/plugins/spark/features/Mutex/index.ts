import { bloxQty } from '@/helpers/bloxfield';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec, BlockType, MutexBlock } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './MutexWidget.vue';

const typeName = BlockType.Mutex;

const block: BlockSpec<MutexBlock> = {
  id: typeName,
  generate: () => ({
    differentActuatorWait: bloxQty('0s'),
    waitRemaining: bloxQty('0s'),
  }),
  fields: [],
};

const feature: WidgetFeature = {
  ...genericBlockFeature,
  id: typeName,
  title: 'Mutex',
  role: 'Constraint',
  component: blockWidgetSelector(widget, typeName),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default { feature, block };
