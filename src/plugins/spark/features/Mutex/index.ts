import { ref } from '@/helpers/component-ref';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features';

import form from './MutexForm.vue';
import widget from './MutexWidget.vue';
import { typeName } from './getters';

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

export default feature;
