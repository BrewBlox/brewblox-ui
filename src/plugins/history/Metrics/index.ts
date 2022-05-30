import { Plugin } from 'vue';

import { WidgetFeature, useFeatureStore } from '@/store/features';
import { Widget } from '@/store/widgets';
import { cref } from '@/utils/component-ref';

import { MetricsConfig } from '../types';
import { emptyMetricsConfig, upgradeMetricsConfig } from '../utils';
import widget from './MetricsWidget.vue';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();

    const feature: WidgetFeature<MetricsConfig> = {
      id: 'Metrics',
      title: 'Metrics',
      component: cref(app, widget),
      wizard: true,
      generateConfig: emptyMetricsConfig,
      widgetSize: {
        cols: 4,
        rows: 4,
      },
      upgrade: (widget: Widget<unknown>): Widget<MetricsConfig> | null => {
        const config = upgradeMetricsConfig(widget.config);
        return config ? { ...widget, config } : null;
      },
    };

    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
