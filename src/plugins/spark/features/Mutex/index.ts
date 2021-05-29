import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
import { sparkStore } from '@/plugins/spark/store';
import { BlockSpec, BlockType, MutexBlock } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils';
import { featureStore, WidgetFeature } from '@/store/features';
import { bloxQty } from '@/utils/bloxfield';

import widget from './MutexWidget.vue';

const type = BlockType.Mutex;

const plugin: Plugin = {
  install(app) {

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

    sparkStore.addBlockSpec(blockSpec);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
