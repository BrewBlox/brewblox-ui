import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
import { BlockType, InactiveObjectBlock } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils';
import { WidgetFeature, useFeatureStore } from '@/store/features';

import widget from './InactiveObjectWidget.vue';

const type = BlockType.InactiveObject;

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();

    const feature: WidgetFeature<InactiveObjectBlock> = {
      ...genericBlockFeature,
      id: type,
      title: 'Inactive Block',
      component: blockWidgetSelector(app, widget, type),
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
