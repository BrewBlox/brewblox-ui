import GenericBlock from '@/services/Spark/components/GenericBlock';
import widget from './PidWidget.vue';

const feature = {
  ...GenericBlock,
  widget,
  displayName: 'PID',
  widgetSize: {
    cols: 5,
    rows: 6,
  },
};

export default feature;
