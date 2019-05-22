import { ref } from '@/helpers/component-ref';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/types';
import { typeName } from './getters';
import form from './MutexForm.vue';
import widget from './MutexWidget.vue';

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'Mutex',
  role: 'Control',
  widget: ref(widget),
  form: ref(form),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default feature;
