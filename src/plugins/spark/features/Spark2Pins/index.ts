import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import { typeName } from './getters';
import widget from './Spark2PinsWidget.vue';
import { Spark2Hardware, Spark2PinsData } from './types';

const block: BlockSpec<Spark2PinsData> = {
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
