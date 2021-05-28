import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
import { sparkStore } from '@/plugins/spark/store';
import { BlockSpec, BlockType, MutexBlock } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils';
import { featureStore, WidgetFeature } from '@/store/features';
import { bloxQty } from '@/utils/bloxfield';

import widget from './MutexWidget.vue';

const typeName = BlockType.Mutex;

const plugin: Plugin = {
  install(app) {

    const spec: BlockSpec<MutexBlock> = {
      id: typeName,
      generate: () => ({
        differentActuatorWait: bloxQty('0s'),
        waitRemaining: bloxQty('0s'),
      }),
      fieldSpecs: [],
    };

    const feature: WidgetFeature = {
      ...genericBlockFeature,
      id: typeName,
      title: 'Mutex',
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
