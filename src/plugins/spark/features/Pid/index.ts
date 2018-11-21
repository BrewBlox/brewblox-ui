import { ref } from '@/helpers/component-ref';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features/state';
import { typeName } from './getters';
import form from './PidForm.vue';
import widget from './PidWidget.vue';

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'PID',
  widget: ref(widget),
  form: ref(form),
  widgetSize: {
    cols: 4,
    rows: 5,
  },
};

export default feature;
