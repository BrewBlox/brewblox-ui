import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec, Spark3PinsBlock } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './Spark3PinsWidget.vue';
const typeName = 'Spark3Pins';

const block: BlockSpec<Spark3PinsBlock> = {
  id: typeName,
  systemObject: true,
  generate: () => ({
    pins: [],
    enableIoSupply5V: false,
    enableIoSupply12V: false,
    soundAlarm: false,
    voltage5: 0,
    voltage12: 0,
  }),
  fields: [
    {
      key: 'soundAlarm',
      title: 'Alarm sound',
      component: 'BoolValEdit',
      generate: () => false,
    },
    {
      key: 'enableIoSupply5V',
      title: 'Enable 5V power supply',
      component: 'BoolValEdit',
      generate: () => true,
    },
    {
      key: 'enableIoSupply12V',
      title: 'Enable 12V power supply',
      component: 'BoolValEdit',
      generate: () => true,
    },
    {
      key: 'voltage5',
      title: 'Measured 5V power supply',
      component: 'NumberValEdit',
      generate: () => 5,
      readonly: true,
    },
    {
      key: 'voltage12',
      title: 'Measured 12V power supply',
      component: 'NumberValEdit',
      generate: () => 12,
      readonly: true,
    },
  ],
};

const feature: WidgetFeature = {
  ...genericBlockFeature,
  id: typeName,
  title: 'Spark 3 Pins',
  role: 'Output',
  component: blockWidgetSelector(widget, typeName),
  widgetSize: {
    cols: 4,
    rows: 4,
  },
  // Spark3Pins is a static system object, and can't be created or deleted
  wizard: false,
  removeActions: undefined,
};

export default { feature, block };
