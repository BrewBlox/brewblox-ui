import { Plugin } from 'vue';

import { featureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils';

import { emptyGraphConfig } from '../getters';
import { GraphConfig } from '../types';
import { typeName } from './getters';
import widget from './GraphWidget.vue';


const plugin: Plugin = {
  install(app) {
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
    };

    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
