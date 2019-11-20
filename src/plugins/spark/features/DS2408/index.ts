import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec } from '@/plugins/spark/types';
import { Feature } from '@/store/features';

import widget from './DS2408Widget.vue';
import { typeName } from './getters';
import { DS2408Data } from './types';

const block: BlockSpec = {
  id: typeName,
  generate: (): DS2408Data => ({
    address: '',
    connected: false,
    pins: [],
  }),
  presets: [],
  changes: [],
};

const feature: Feature = {
  ...genericBlockFeature,
  id: typeName,
  displayName: 'DS2408 Chip',
  role: 'Output',
  widgetComponent: blockWidgetSelector(widget),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
  // Discovered objects can't be created or deleted
  wizardComponent: null,
  deleters: undefined,
};

export default { feature, block };
