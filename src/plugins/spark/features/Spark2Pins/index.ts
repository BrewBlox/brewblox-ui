import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec } from '@/plugins/spark/types';
import { Feature } from '@/store/features';

import { typeName } from './getters';
import widget from './Spark2PinsWidget.vue';
import { Spark2Hardware, Spark2PinsData } from './types';

const block: BlockSpec = {
  id: typeName,
  systemObject: true,
  generate: (): Spark2PinsData => ({
    pins: [],
    soundAlarm: false,
    hardware: Spark2Hardware.Unknown,
  }),
  changes: [],
  presets: [],
};

const feature: Feature = {
  ...genericBlockFeature,
  id: typeName,
  displayName: 'Spark 2 Pins',
  role: 'Output',
  widgetComponent: blockWidgetSelector(widget),
  widgetSize: {
    cols: 4,
    rows: 4,
  },
  // Spark2Pins is a static system object, and can't be created or deleted
  wizardComponent: null,
  deleters: undefined,
};

export default { feature, block };
