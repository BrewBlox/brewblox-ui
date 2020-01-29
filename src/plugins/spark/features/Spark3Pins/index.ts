import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import { typeName } from './getters';
import widget from './Spark3PinsWidget.vue';
import { Spark3PinsData } from './types';

const block: BlockSpec = {
  id: typeName,
  systemObject: true,
  generate: (): Spark3PinsData => ({
    pins: [],
    enableIoSupply5V: false,
    enableIoSupply12V: false,
    soundAlarm: false,
    voltage5: 0,
    voltage12: 0,
  }),
  changes: [
    {
      key: 'soundAlarm',
      title: 'Alarm sound',
      component: 'BoolValEdit',
      generate: () => false,
    },
  ],
  presets: [],
};

const feature: WidgetFeature = {
  ...genericBlockFeature,
  id: typeName,
  title: 'Spark 3 Pins',
  role: 'Output',
  widgetComponent: blockWidgetSelector(widget),
  widgetSize: {
    cols: 4,
    rows: 4,
  },
  // Spark3Pins is a static system object, and can't be created or deleted
  wizardComponent: null,
  deleters: undefined,
};

export default { feature, block };
