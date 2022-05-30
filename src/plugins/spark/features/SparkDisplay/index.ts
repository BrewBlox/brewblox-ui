import { Plugin } from 'vue';

import { WidgetFeature, useFeatureStore } from '@/store/features';
import { cref } from '@/utils/component-ref';

import widget from './SparkDisplayWidget.vue';
import { SparkDisplayConfig } from './types';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();

    const feature: WidgetFeature<SparkDisplayConfig> = {
      id: 'SparkDisplay',
      title: 'Spark Sim Display',
      component: cref(app, widget),
      wizard: true,
      widgetSize: {
        cols: 4,
        rows: 3,
      },
      generateConfig: () => ({
        serviceId: null,
      }),
    };

    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
