import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/utils/components';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { BlockType } from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import widget from './DeprecatedObjectWidget.vue';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();

    const feature: WidgetFeature = {
      ...genericBlockFeature,
      id: BlockType.DeprecatedObject,
      title: 'Deprecated Object',
      role: 'Other',
      component: blockWidgetSelector(app, widget, null),
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
