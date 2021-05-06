import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
import { sparkStore } from '@/plugins/spark/store';
import { BalancerBlock, BlockSpec, BlockType } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils';
import { featureStore, WidgetFeature } from '@/store/features';

import widget from './BalancerWidget.vue';

const typeName = BlockType.Balancer;


const plugin: Plugin = {
  install(app) {
    const spec: BlockSpec<BalancerBlock> = {
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
      component: blockWidgetSelector(app, widget, typeName),
      widgetSize: {
        cols: 4,
        rows: 2,
      },
    };

    sparkStore.addBlockSpec(spec);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
