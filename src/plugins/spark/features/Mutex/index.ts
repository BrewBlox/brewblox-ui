import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features/state';
import { typeName } from './getters';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import widget from './MutexWidget.vue';
import form from './MutexForm.vue';

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'Mutex',
  widget: ref(widget),
  form: ref(form),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default feature;
