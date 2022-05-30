import { Plugin } from 'vue';

import { WidgetFeature, useFeatureStore } from '@/store/features';
import { cref } from '@/utils/component-ref';

import widget from './WebframeWidget.vue';
import { WebframeConfig } from './types';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();

    const feature: WidgetFeature<WebframeConfig> = {
      id: 'Webframe',
      title: 'Web Frame',
      component: cref(app, widget),
      wizard: true,
      widgetSize: {
        cols: 4,
        rows: 4,
      },
      generateConfig: () => ({
        url: '',
        scale: 1,
      }),
    };

    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
