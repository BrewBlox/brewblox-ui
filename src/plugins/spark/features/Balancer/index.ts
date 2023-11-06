import widget from './BalancerWidget.vue';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockSpec } from '@/plugins/spark/types';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import { BalancerBlock, BlockType } from 'brewblox-proto/ts';
import { Plugin } from 'vue';

const type = BlockType.Balancer;
const title = 'Balancer';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();
    const specStore = useBlockSpecStore();

    const blockSpec: BlockSpec<BalancerBlock> = {
      type,
      title,
      generate: (): BalancerBlock['data'] => ({
        clients: [],
      }),
      analyze: () => 'Active',
    };

    const feature: WidgetFeature = {
      ...genericBlockFeature,
      id: type,
      title,
      role: 'Constraint',
      component: cref(app, widget),
      widgetSize: {
        cols: 4,
        rows: 2,
      },
    };

    specStore.addBlockSpec(blockSpec);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
