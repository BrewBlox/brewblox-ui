import widget from './DisplaySettingsWidget.vue';
import { systemBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockFieldSpec, BlockSpec } from '@/plugins/spark/types';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import { BlockType, DisplaySettingsBlock } from 'brewblox-proto/ts';
import { Plugin } from 'vue';

const type = BlockType.DisplaySettings;
const title = 'Spark Display';

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<DisplaySettingsBlock> = {
      type,
      title,
      generate: (): DisplaySettingsBlock['data'] => ({
        name: 'Display settings',
        widgets: [],
      }),
      analyze: () => 'Active',
    };

    const fieldSpecs: BlockFieldSpec<DisplaySettingsBlock>[] = [
      {
        type,
        key: 'name',
        title: 'Footer text',
        component: 'StringValEdit',
        generate: () => '',
      },
    ];

    const feature: WidgetFeature = {
      ...systemBlockFeature,
      id: type,
      title,
      role: 'Display',
      component: cref(app, widget),
      widgetSize: {
        cols: 4,
        rows: 3,
      },
    };

    specStore.addBlockSpec(blockSpec);
    specStore.addFieldSpecs(fieldSpecs);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
