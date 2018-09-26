import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features/state';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import widget from './TempSensorMockWidget.vue';
import { typeName } from './getters';

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'Mock Temperature Sensor',
  widget: ref(widget),
  widgetSize: {
    cols: 3,
    rows: 2,
  },
};

export default feature;
