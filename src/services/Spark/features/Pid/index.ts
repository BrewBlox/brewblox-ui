import GenericBlock from '@/services/Spark/components/GenericBlock';
import widget from './PidWidget.vue';

const feature = {
  ...GenericBlock,
  widget,
  displayName: 'PID',
  widgetSize: {
    cols: 4,
    rows: 3,
  },
};

export default feature;
