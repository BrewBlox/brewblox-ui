import { Plugin } from 'vue';

import { startup } from '@/startup';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { autoRegister, cref } from '@/utils/component-ref';

import blueprints from './blueprints';
import BuilderWidget from './BuilderWidget.vue';
import { useBuilderStore } from './store';
import { BuilderConfig } from './types';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();
    const builderStore = useBuilderStore();

    const widget: WidgetFeature<BuilderConfig> = {
      id: 'Builder',
      title: 'Brewery Builder',
      component: cref(app, BuilderWidget),
      wizard: true,
      widgetSize: {
        cols: 8,
        rows: 8,
      },
      generateConfig: () => ({
        currentLayoutId: null,
        layoutIds: [],
      }),
    };

    startup.onStart(() => builderStore.start());
    autoRegister(app, require.context('./components', true));

    builderStore.blueprints = Object.values(blueprints);
    featureStore.addWidgetFeature(widget);
  },
};

export default plugin;
