import { Plugin } from 'vue';

import { featureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';

import OneWireGpioTestWidget from './OneWireGpioTestWidget.vue';

const typeName = 'OneWireGpioTest';

const plugin: Plugin = {
  install(app) {

    const feature: WidgetFeature = {
      id: typeName,
      title: 'OneWire GPIO test',
      role: 'Output',
      component: cref(app, OneWireGpioTestWidget),
      wizard: true,
      generateConfig: () => ({}),
      widgetSize: {
        cols: 4,
        rows: 4,
      },
    };

    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
