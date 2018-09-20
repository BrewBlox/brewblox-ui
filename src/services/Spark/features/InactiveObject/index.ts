import GenericBlock from '@/services/Spark/components/GenericBlock';
import widget from './InactiveObjectWidget.vue';

const feature = {
  ...GenericBlock,
  widget,
  displayName: 'Inactive Object',
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default feature;
