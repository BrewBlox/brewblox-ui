import { Plugin } from 'vue';

import { featureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils';

import widget from './StopwatchWidget.vue';
import { StopwatchConfig } from './types';


const plugin: Plugin = {
  install(app) {
    const feature: WidgetFeature<StopwatchConfig> = {
      id: 'Stopwatch',
      title: 'Stopwatch',
      component: cref(app, widget),
      wizard: true,
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
