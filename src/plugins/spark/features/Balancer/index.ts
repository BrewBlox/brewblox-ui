import { ref } from '@/helpers/component-ref';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/types';
import form from './BalancerForm.vue';
import widget from './BalancerWidget.vue';
import { typeName } from './getters';

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'Balancer',
  role: 'Constraint',
  widget: ref(widget),
  form: ref(form),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default feature;
