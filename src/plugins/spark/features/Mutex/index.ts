import { Unit } from '@/helpers/units';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features';

import { blockWidgetSelector } from '../../helpers';
import { BlockSpec } from '../../types';
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
  ...GenericBlock,
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
