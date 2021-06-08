import { Plugin } from 'vue';

import { featureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils';

import widget from './SparkDisplayWidget.vue';
import { SparkDisplayConfig } from './types';

const plugin: Plugin = {
  install(app) {

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
