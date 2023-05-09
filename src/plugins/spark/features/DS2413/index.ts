import { discoveredBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockSpec } from '@/plugins/spark/types';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import { BlockType, DS2413Block } from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import widget from './DS2413Widget.vue';

const type = BlockType.DS2413;
const title = 'DS2413 Chip';

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<DS2413Block> = {
      type,
      title,
      generate: (): DS2413Block['data'] => ({
        oneWireBusId: 0,
        address: '',
        connected: false,
        channels: [],
      }),
      analyze: (block: DS2413Block) => {
        if (!block.data.connected) {
          return 'Invalid';
        }
        return 'Active';
      },
    };

    const feature: WidgetFeature = {
      ...discoveredBlockFeature,
      id: type,
      title,
      role: 'Output',
      component: cref(app, widget),
      widgetSize: {
        cols: 4,
        rows: 3,
      },
    };

    specStore.addBlockSpec(blockSpec);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
