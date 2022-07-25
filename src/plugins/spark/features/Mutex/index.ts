import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockSpec } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils/components';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { bloxQty } from '@/utils/quantity';
import { BlockType, MutexBlock } from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import widget from './MutexWidget.vue';

const type = BlockType.Mutex;

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<MutexBlock> = {
      type,
      generate: () => ({
        differentActuatorWait: bloxQty('0s'),
        waitRemaining: bloxQty('0s'),
      }),
    };

    const feature: WidgetFeature = {
      ...genericBlockFeature,
      id: type,
      title: 'Mutex',
      role: 'Constraint',
      component: blockWidgetSelector(app, widget, type),
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
