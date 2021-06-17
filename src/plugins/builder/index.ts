import { Plugin } from 'vue';

import { startup } from '@/startup';
import { featureStore, WidgetFeature } from '@/store/features';
import { autoRegister, cref } from '@/utils/component-ref';

import BuilderWidget from './BuilderWidget.vue';
import specs from './specs';
import { builderStore } from './store';
import { BuilderConfig } from './types';


const plugin: Plugin = {
  install(app) {

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

    builderStore.specs = Object.values(specs);
    featureStore.addWidgetFeature(widget);
  },

};

export default plugin;
