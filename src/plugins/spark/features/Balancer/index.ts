import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features';

import { blockWidgetSelector } from '../../helpers';
import { BlockSpec } from '../../types';
import widget from './BalancerWidget.vue';
import { typeName } from './getters';
import { BalancerData } from './types';

const block: BlockSpec = {
  id: typeName,
  generate: (): BalancerData => ({
    clients: [],
  }),
  presets: [],
  changes: [],
};

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'Balancer',
  role: 'Constraint',
  widgetComponent: blockWidgetSelector(widget),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default { feature, block };
