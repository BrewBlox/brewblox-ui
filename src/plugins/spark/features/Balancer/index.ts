import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './BalancerWidget.vue';
import { BalancerBlock } from './types';

const typeName = 'Balancer';

const block: BlockSpec<BalancerBlock> = {
  id: typeName,
  generate: () => ({
    clients: [],
  }),
  fields: [],
};

const feature: WidgetFeature = {
  ...genericBlockFeature,
  id: typeName,
  title: 'Balancer',
  role: 'Constraint',
  component: blockWidgetSelector(widget, typeName),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default { feature, block };
