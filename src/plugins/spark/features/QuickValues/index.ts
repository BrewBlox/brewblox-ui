import { Plugin } from 'vue';

import { featureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';

import widget from './QuickValuesWidget.vue';
import { QuickValuesConfig } from './types';


const plugin: Plugin = {
  install(app) {

    const feature: WidgetFeature<QuickValuesConfig> = {
      id: 'QuickValues',
      title: 'Quick Values',
      component: cref(app, widget),
      wizard: true,
      widgetSize: {
        cols: 4,
        rows: 4,
      },
      generateConfig: () => ({
        addr: {
          serviceId: null,
          id: null,
          type: null,
          field: null,
        },
        values: [],
        sliders: [],
      }),
    };

    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
