import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features/state';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import widget from './TempSensorOneWireWidget.vue';

const feature: Feature = {
  ...GenericBlock,
  id: 'TempSensorOneWire',
  displayName: 'Onewire Temperature Sensor',
  widget: ref(widget),
  widgetSize: {
    cols: 4,
    rows: 3,
  },
};

export default feature;
