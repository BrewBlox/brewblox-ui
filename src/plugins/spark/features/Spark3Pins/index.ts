import { ref } from '@/helpers/component-ref';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features';

import { BlockSpec } from '../../types';
import form from './Spark3PinsForm.vue';
import widget from './Spark3PinsWidget.vue';
import { typeName } from './getters';
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
  displayName: 'Spark 3 Pin Array',
  role: 'Output',
  widget: ref(widget),
  form: ref(form),
  widgetSize: {
    cols: 4,
    rows: 4,
  },
  // Spark3Pins is a static system object, and can't be created or deleted
  wizard: undefined,
  deleters: undefined,
};

export default { feature, block };
