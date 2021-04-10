import { Plugin } from 'vue';

import { featureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';

import widget from './MetricsWidget.vue';
import { MetricsConfig } from './types';

const plugin: Plugin = {
  install(app) {

    const feature: WidgetFeature<MetricsConfig> = {
      id: 'Metrics',
      title: 'Metrics',
      component: cref(app, widget),
      wizard: true,
      generateConfig: () => ({
        targets: [],
        renames: {},
        params: {},
        freshDuration: {},
        decimals: {},
      }),
      widgetSize: {
        cols: 4,
        rows: 4,
      },
    };

    featureStore.registerWidget(feature);
  },
};

export default plugin;
