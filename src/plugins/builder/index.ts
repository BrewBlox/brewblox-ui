import { Plugin } from 'vue';

import { startup } from '@/plugins/startup';
import { featureStore, WidgetFeature } from '@/store/features';
import { autoRegister, cref } from '@/utils/component-ref';

import widget from './BuilderWidget.vue';
import { typeName } from './const';
import specs from './specs';
import { builderStore } from './store';
import { BuilderConfig } from './types';


const plugin: Plugin = {
  install(app) {

    const feature: WidgetFeature<BuilderConfig> = {
      id: typeName,
      title: 'Brewery Builder',
      component: cref(app, widget),
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

    builderStore.registerParts(Object.values(specs));
    featureStore.registerWidget(feature);
  },

};

export default plugin;
