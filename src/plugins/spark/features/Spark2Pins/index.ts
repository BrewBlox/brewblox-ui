import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features';

import { blockWidgetSelector } from '../../helpers';
import { BlockSpec } from '../../types';
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
  ...GenericBlock,
  id: typeName,
  displayName: 'Spark 2 Pins',
  role: 'Output',
  widgetComponent: blockWidgetSelector(widget),
  widgetSize: {
    cols: 4,
    rows: 4,
  },
  // Spark2Pins is a static system object, and can't be created or deleted
  wizardComponent: undefined,
  deleters: undefined,
};

export default { feature, block };
