import { useFeatureStore, WidgetFeature } from '@/store/features';
import { Widget } from '@/store/widgets';
import { cref } from '@/utils/component-ref';
import { Plugin } from 'vue';
import { GraphConfig } from '../types';
import { emptyGraphConfig, upgradeGraphConfig } from '../utils';
import { typeName } from './const';
import widget from './GraphWidget.vue';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();

    const feature: WidgetFeature<GraphConfig> = {
      id: typeName,
      title: 'Graph',
      component: cref(app, widget),
      wizard: true,
      generateConfig: emptyGraphConfig,
      widgetSize: {
        cols: 10,
        rows: 5,
      },
      upgrade: (widget: Widget<unknown>): Widget<GraphConfig> | null => {
        const config = upgradeGraphConfig(widget.config);
        return config ? { ...widget, config } : null;
      },
    };

    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
