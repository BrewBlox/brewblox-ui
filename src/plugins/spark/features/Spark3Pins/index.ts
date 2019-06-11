import { ref } from '@/helpers/component-ref';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features';

import { BlockSpec } from '../../types';
import form from './Spark3PinsForm.vue';
import widget from './Spark3PinsWidget.vue';
import { typeName } from './getters';

const block: BlockSpec = {
  id: typeName,
  systemObject: true,
  generate: () => ({
    pins: [],
  }),
  changes: [],
  presets: [],
};

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'Spark Pins',
  role: 'Output',
  widget: ref(widget),
  form: ref(form),
  widgetSize: {
    cols: 4,
    rows: 4,
  },
  // Spark3Pins is a static system object, and can't be created or deleted
  wizard: undefined,
  deleters: undefined,
};

export default { feature, block };
