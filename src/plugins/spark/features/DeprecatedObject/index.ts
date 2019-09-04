import { ref } from '@/helpers/component-ref';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features';

import widget from './DeprecatedObjectWidget.vue';

const feature: Feature = {
  ...GenericBlock,
  id: 'DeprecatedObject',
  displayName: 'Deprecated Object',
  role: 'Other',
  widget: ref(widget),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
  wizard: undefined,
};

export default { feature };
