import { ref } from '@/helpers/component-ref';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features/state';
import { typeName } from './getters';
import form from './InactiveObjectForm.vue';
import widget from './InactiveObjectWidget.vue';

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'Inactive Object',
  widget: ref(widget),
  form: ref(form),
  wizard: undefined,
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default feature;
