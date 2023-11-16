import { BlockType, Spark2Hardware, Spark2PinsBlock } from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import { systemBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockSpec } from '@/plugins/spark/types';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import widget from './Spark2PinsWidget.vue';

const type = BlockType.Spark2Pins;
const title = 'Spark 2 Pins';

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<Spark2PinsBlock> = {
      type,
      title,
      hasRelations: true,
      generate: (): Spark2PinsBlock['data'] => ({
        channels: [],
        soundAlarm: false,
        hardware: Spark2Hardware.HW_UNKNOWN,
      }),
      analyze: () => 'Active',
    };

    const feature: WidgetFeature = {
      ...systemBlockFeature,
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
