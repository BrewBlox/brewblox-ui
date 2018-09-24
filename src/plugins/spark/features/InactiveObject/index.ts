import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features/state';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import widget from './InactiveObjectWidget.vue';

const feature: Feature = {
  ...GenericBlock,
  id: 'InactiveObject',
  displayName: 'Inactive Object',
  widget: ref(widget),
  widgetSize: {
    cols: 3,
    rows: 2,
  },
};

export default feature;
