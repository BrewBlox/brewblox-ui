import widget from './StopwatchWidget.vue';
import { StopwatchConfig } from './types';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import { Plugin } from 'vue';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();

    const feature: WidgetFeature<StopwatchConfig> = {
      id: 'Stopwatch',
      title: 'Stopwatch',
      component: cref(app, widget),
      widgetSize: {
        cols: 4,
        rows: 2,
      },
      generateConfig: () => ({
        session: null,
      }),
    };

    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
