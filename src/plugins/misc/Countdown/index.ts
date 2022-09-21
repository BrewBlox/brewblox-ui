import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import { Plugin } from 'vue';
import widget from './CountdownWidget.vue';
import { CountdownConfig } from './types';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();

    const feature: WidgetFeature<CountdownConfig> = {
      id: 'Countdown',
      title: 'Countdown',
      component: cref(app, widget),
      wizard: true,
      widgetSize: {
        cols: 4,
        rows: 3,
      },
      generateConfig: () => ({
        session: null,
        baseDuration: 10 * 60 * 1000,
      }),
    };

    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
