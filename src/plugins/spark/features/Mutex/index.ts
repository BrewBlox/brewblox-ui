import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec } from '@/plugins/spark/types';
import { Unit } from '@/plugins/spark/units';
import { WidgetFeature } from '@/store/features';

import widget from './MutexWidget.vue';
import { MutexBlock } from './types';

const typeName = 'Mutex';

const block: BlockSpec<MutexBlock> = {
  id: typeName,
  generate: () => ({
    differentActuatorWait: new Unit(0, 'second'),
    waitRemaining: new Unit(0, 'second'),
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
