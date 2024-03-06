import {
  BlockType,
  SequenceBlock,
  SequenceError,
  SequenceStatus,
} from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockSpec } from '@/plugins/spark/types';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import { bloxLink } from '@/utils/link';
import { bloxQty } from '@/utils/quantity';
import widget from './SequenceWidget.vue';

const type = BlockType.Sequence;
const title = 'Sequence';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();
    const specStore = useBlockSpecStore();

    const blockSpec: BlockSpec<SequenceBlock> = {
      type,
      title,
      generate: (): SequenceBlock['data'] => ({
        enabled: false,
        overrideState: false,
        activeInstruction: 0,
        elapsed: bloxQty('0s'),
        status: SequenceStatus.UNKNOWN,
        error: SequenceError.NONE,
        instructions: [],
        variablesId: bloxLink(null),
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
      title,
      role: 'Process',
      component: cref(app, widget),
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
