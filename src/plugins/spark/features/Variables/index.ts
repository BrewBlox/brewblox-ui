import { BlockType, VariablesBlock } from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockSpec } from '@/plugins/spark/types';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import widget from './VariablesWidget.vue';

const type = BlockType.Variables;
const title = 'Variables';

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<VariablesBlock> = {
      type,
      title,
      hasRelations: true,
      generate: (): VariablesBlock['data'] => ({
        variables: {},
      }),
      analyze: (block: VariablesBlock) => {
        const { variables } = block.data;
        if (Object.keys(variables).length === 0) {
          return 'Inactive';
        }
        return 'Active';
      },
    };

    const feature: WidgetFeature = {
      ...genericBlockFeature,
      id: type,
      title,
      role: 'Control',
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
