import widget from './QuickValuesWidget.vue';
import { QuickValuesConfig } from './types';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import { Plugin } from 'vue';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();

    const feature: WidgetFeature<QuickValuesConfig> = {
      id: 'QuickValues',
      title: 'Quick Values',
      component: cref(app, widget),
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
