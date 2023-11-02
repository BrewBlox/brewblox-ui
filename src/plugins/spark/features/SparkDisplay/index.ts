import widget from './SparkDisplayWidget.vue';
import { SparkDisplayConfig } from './types';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import { Plugin } from 'vue';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();

    const feature: WidgetFeature<SparkDisplayConfig> = {
      id: 'SparkDisplay',
      title: 'Spark Sim Display',
      component: cref(app, widget),
      widgetSize: {
        cols: 4,
        rows: 4,
      },
      generateConfig: () => ({
        serviceId: null,
      }),
    };

    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
