import { Unit } from '@/helpers/units';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import { typeName } from './getters';
import widget from './MutexWidget.vue';
import { MutexData } from './types';

const block: BlockSpec<MutexData> = {
  id: typeName,
  generate: () => ({
    differentActuatorWait: new Unit(0, 'second'),
    waitRemaining: new Unit(0, 'second'),
  }),
  changes: [],
  presets: [],
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
