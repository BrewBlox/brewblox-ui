import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features';

import { blockWidgetSelector } from '../../helpers';
import { BlockSpec } from '../../types';
import widget from './DS2413Widget.vue';
import { typeName } from './getters';
import { DS2413Data } from './types';

const block: BlockSpec = {
  id: typeName,
  generate: (): DS2413Data => ({
    address: '',
    connected: false,
    pins: [],
  }),
  presets: [],
  changes: [],
};

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'DS2413 Chip',
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
