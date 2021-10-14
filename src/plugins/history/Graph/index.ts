import { Plugin } from 'vue';

import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';

import { emptyGraphConfig } from '../const';
import { GraphConfig } from '../types';
import { typeName } from './const';
import widget from './GraphWidget.vue';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();

    const feature: WidgetFeature<GraphConfig> = {
      id: typeName,
      title: 'Graph',
      component: cref(app, widget),
      wizard: true,
      generateConfig: emptyGraphConfig,
      widgetSize: {
        cols: 10,
        rows: 5,
      },
    };

    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
