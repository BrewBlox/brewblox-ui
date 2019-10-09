import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features';

import { blockWidgetSelector } from '../../helpers';
import { BlockSpec } from '../../types';
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

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'Spark 3 Pins',
  role: 'Output',
  widgetComponent: blockWidgetSelector(widget),
  widgetSize: {
    cols: 4,
    rows: 4,
  },
  // Spark3Pins is a static system object, and can't be created or deleted
  wizardComponent: undefined,
  deleters: undefined,
};

export default { feature, block };
