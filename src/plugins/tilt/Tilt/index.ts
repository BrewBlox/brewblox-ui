import { Plugin } from 'vue';

import { featureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils';

import widget from './TiltWidget.vue';
import { TiltWidgetConfig } from './types';

const plugin: Plugin = {
  install(app) {
    const feature: WidgetFeature<TiltWidgetConfig> = {
      id: 'Tilt',
      title: 'Tilt',
      component: cref(app, widget),
      wizard: true,
      widgetSize: {
        cols: 4,
        rows: 4,
      },
      generateConfig: () => ({
        serviceId: null,
        color: null,
        hidden: {},
      }),
    };

    featureStore.addWidgetFeature(feature);
  },
};


export default plugin;
