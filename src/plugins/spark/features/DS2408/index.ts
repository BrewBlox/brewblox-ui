import widget from './DS2408Widget.vue';
import { discoveredBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockSpec } from '@/plugins/spark/types';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import { BlockType, DS2408Block, DS2408ConnectMode } from 'brewblox-proto/ts';
import { Plugin } from 'vue';

const type = BlockType.DS2408;
const title = 'DS2408 Chip';

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<DS2408Block> = {
      type,
      title,
      generate: (): DS2408Block['data'] => ({
        oneWireBusId: 0,
        address: '',
        connected: false,
        channels: [],
        connectMode: DS2408ConnectMode.CONNECT_VALVE,
      }),
      analyze: (block: DS2408Block) => {
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
