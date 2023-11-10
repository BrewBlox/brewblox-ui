import { Plugin } from 'vue';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import widget from './TiltWidget.vue';
import { TiltWidgetConfig } from './types';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();

    const feature: WidgetFeature<TiltWidgetConfig> = {
      id: 'Tilt',
      title: 'Tilt',
      component: cref(app, widget),
      widgetSize: {
        cols: 4,
        rows: 4,
      },
      generateConfig: () => ({
        serviceId: null,
        mac: null,
        hidden: {},
      }),
    };

    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
