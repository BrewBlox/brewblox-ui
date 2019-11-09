import { Unit } from '@/helpers/units';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec } from '@/plugins/spark/types';
import { Feature } from '@/store/features';

import { typeName } from './getters';
import widget from './MutexWidget.vue';
import { MutexData } from './types';

const block: BlockSpec = {
  id: typeName,
  generate: (): MutexData => ({
    differentActuatorWait: new Unit(0, 'second'),
  }),
  changes: [],
  presets: [],
};

const feature: Feature = {
  ...genericBlockFeature,
  id: typeName,
  displayName: 'Mutex',
  role: 'Constraint',
  widgetComponent: blockWidgetSelector(widget),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default { feature, block };
