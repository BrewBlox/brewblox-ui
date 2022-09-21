import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import { Plugin } from 'vue';
import { WebframeConfig } from './types';
import widget from './WebframeWidget.vue';

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
