import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockSpec } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils/components';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { bloxQty } from '@/utils/quantity';
import {
  BlockType,
  SequenceBlock,
  SequenceError,
  SequenceStatus,
} from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import widget from './SequenceWidget.vue';

const type = BlockType.Sequence;

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();
    const specStore = useBlockSpecStore();

    const blockSpec: BlockSpec<SequenceBlock> = {
      type,
      generate: (): SequenceBlock['data'] => ({
        enabled: false,
        overrideState: false,
        activeInstruction: 0,
        activeInstructionStartedAt: null,
        disabledAt: null,
        disabledDuration: bloxQty('0s'),
        status: SequenceStatus.UNKNOWN,
        error: SequenceError.NONE,
        instructions: [],
      }),
      analyze: (block: SequenceBlock) => {
        const { enabled, status } = block.data;
        if (!enabled) {
          return 'Disabled';
        }
        if (status === SequenceStatus.ERROR) {
          return 'Invalid';
        }
        return 'Active';
      },
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
