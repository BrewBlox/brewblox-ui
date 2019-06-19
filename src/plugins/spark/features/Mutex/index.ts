import { ref } from '@/helpers/component-ref';
import { Unit } from '@/helpers/units';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features';

import { BlockSpec } from '../../types';
import form from './MutexForm.vue';
import widget from './MutexWidget.vue';
import { typeName } from './getters';
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
  widget: ref(widget),
  form: ref(form),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default { feature, block };
