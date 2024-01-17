import { BlockType, MutexBlock } from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockSpec } from '@/plugins/spark/types';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import { bloxQty } from '@/utils/quantity';
import widget from './MutexWidget.vue';

const type = BlockType.Mutex;
const title = 'Mutex';

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<MutexBlock> = {
      type,
      title,
      generate: (): MutexBlock['data'] => ({
        waitRemaining: bloxQty('0s'),
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
