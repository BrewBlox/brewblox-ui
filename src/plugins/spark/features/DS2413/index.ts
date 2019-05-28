import { ref } from '@/helpers/component-ref';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features';

import form from './DS2413Form.vue';
import widget from './DS2413Widget.vue';
import { typeName } from './getters';

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'DS2413 Chip',
  role: 'Output',
  widget: ref(widget),
  form: ref(form),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
  // Discovered objects can't be created or deleted
  wizard: undefined,
  deleters: undefined,
};

export default feature;
