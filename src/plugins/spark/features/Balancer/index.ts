import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
import { sparkStore } from '@/plugins/spark/store';
import { BalancerBlock, BlockSpec, BlockType } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils';
import { featureStore, WidgetFeature } from '@/store/features';

import widget from './BalancerWidget.vue';

const type = BlockType.Balancer;


const plugin: Plugin = {
  install(app) {
    const blockSpec: BlockSpec<BalancerBlock> = {
      type,
      generate: () => ({
        clients: [],
      }),
    };

    const feature: WidgetFeature = {
      ...genericBlockFeature,
      id: type,
      title: 'Balancer',
      role: 'Constraint',
      component: blockWidgetSelector(app, widget, type),
      widgetSize: {
        cols: 4,
        rows: 2,
      },
    };

    sparkStore.addBlockSpec(blockSpec);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
