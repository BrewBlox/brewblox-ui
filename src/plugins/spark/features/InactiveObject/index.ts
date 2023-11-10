import { BlockType } from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { BlockConfig } from '@/plugins/spark/types';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import widget from './InactiveObjectWidget.vue';

const type = BlockType.InactiveObject;

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();

    const feature: WidgetFeature<BlockConfig> = {
      ...genericBlockFeature,
      id: type,
      title: 'Inactive Block',
      component: cref(app, widget),
      creatable: false,
      widgetSize: {
        cols: 4,
        rows: 2,
      },
    };

    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
