import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './Spark2PinsWidget.vue';
import { Spark2Hardware, Spark2PinsBlock } from './types';

const typeName = 'Spark2Pins';

const block: BlockSpec<Spark2PinsBlock> = {
  id: typeName,
  systemObject: true,
  generate: () => ({
    pins: [],
    soundAlarm: false,
    hardware: Spark2Hardware.Unknown,
  }),
  fields: [],
};

const feature: WidgetFeature = {
  ...genericBlockFeature,
  id: typeName,
  title: 'Spark 2 Pins',
  role: 'Output',
  component: blockWidgetSelector(widget, typeName),
  widgetSize: {
    cols: 4,
    rows: 4,
  },
  // System objects can't be created or deleted
  wizard: false,
  removeActions: undefined,
};

export default { feature, block };
