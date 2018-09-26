import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features/state';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import widget from './TempSensorOneWireWidget.vue';
import { typeName } from './getters';

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'Onewire Temperature Sensor',
  widget: ref(widget),
  widgetSize: {
    cols: 4,
    rows: 3,
  },
};

export default feature;
