import { BlockType, MockPinsBlock } from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockSpec } from '@/plugins/spark/types';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import widget from './MockPinsWidget.vue';

const type = BlockType.MockPins;
const title = 'Mock Pins';

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<MockPinsBlock> = {
      type,
      title,
      hasRelations: true,
      generate: (): MockPinsBlock['data'] => ({
        channels: [],
      }),
      analyze: () => 'Active',
    };

    const feature: WidgetFeature = {
      ...genericBlockFeature,
      id: type,
      title,
      role: 'Output',
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
