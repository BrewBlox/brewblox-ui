import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './DS2413Widget.vue';
import { typeName } from './getters';
import { DS2413Data } from './types';

const block: BlockSpec<DS2413Data> = {
  id: typeName,
  generate: () => ({
    address: '',
    connected: false,
    pins: [],
  }),
  fields: [],
};

const feature: WidgetFeature = {
  ...genericBlockFeature,
  id: typeName,
  title: 'DS2413 Chip',
  role: 'Output',
  component: blockWidgetSelector(widget, typeName),
  widgetSize: {
    cols: 4,
    rows: 3,
  },
  wizard: 'BlockDiscoveryWizard',
};

export default { feature, block };
