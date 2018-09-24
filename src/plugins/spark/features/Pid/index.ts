import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features/state';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import widget from './PidWidget.vue';

const feature: Feature = {
  ...GenericBlock,
  id: 'Pid',
  displayName: 'PID',
  widget: ref(widget),
  widgetSize: {
    cols: 5,
    rows: 6,
  },
};

export default feature;
