import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features/state';
import { typeName } from './getters';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import widget from './PidWidget.vue';
import form from './PidForm.vue';

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'PID',
  widget: ref(widget),
  form: ref(form),
  widgetSize: {
    cols: 4,
    rows: 3,
  },
};

export default feature;
