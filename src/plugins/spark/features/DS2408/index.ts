import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec, DS2408Block } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './DS2408Widget.vue';

const typeName = 'DS2408';

const block: BlockSpec<DS2408Block> = {
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
  title: 'DS2408 Chip',
  role: 'Output',
  component: blockWidgetSelector(widget, typeName),
  widgetSize: {
    cols: 4,
    rows: 3,
  },
  wizard: 'BlockDiscoveryWizard',
};

export default { feature, block };
