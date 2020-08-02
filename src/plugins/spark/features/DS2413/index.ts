import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec, BlockType, DS2413Block } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './DS2413Widget.vue';

const typeName = BlockType.DS2413;

const block: BlockSpec<DS2413Block> = {
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
