import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockSpec, BlockType, SequenceBlock } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils';
import { SequenceError, SequenceStatus } from '@/shared-types';
import { WidgetFeature, useFeatureStore } from '@/store/features';

import widget from './SequenceWidget.vue';

const type = BlockType.Sequence;

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();
    const specStore = useBlockSpecStore();

    const blockSpec: BlockSpec<SequenceBlock> = {
      type,
      generate: () => ({
        enabled: false,
        overrideState: false,
        activeInstruction: 0,
        activeInstructionStartedAt: 0,
        disabledAt: 0,
        disabledDuration: 0,
        status: SequenceStatus.UNKNOWN,
        error: SequenceError.NONE,
        instructions: [],
      }),
    };

    const feature: WidgetFeature = {
      ...genericBlockFeature,
      id: type,
      title: 'Sequence',
      role: 'Process',
      component: blockWidgetSelector(app, widget, type),
      widgetSize: {
        cols: 4,
        rows: 4,
      },
    };

    specStore.addBlockSpec(blockSpec);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
