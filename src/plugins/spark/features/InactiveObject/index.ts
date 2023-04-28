import { genericBlockFeature } from '@/plugins/spark/generic';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import { BlockType, InactiveObjectBlock } from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import widget from './InactiveObjectWidget.vue';

const type = BlockType.InactiveObject;

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();

    const feature: WidgetFeature<InactiveObjectBlock> = {
      ...genericBlockFeature,
      id: type,
      title: 'Inactive Block',
      component: cref(app, widget),
      wizard: false,
      widgetSize: {
        cols: 4,
        rows: 2,
      },
    };

    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
