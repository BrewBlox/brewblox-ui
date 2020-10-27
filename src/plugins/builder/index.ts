import { VueConstructor } from 'vue';

import { autoRegister, ref } from '@/helpers/component-ref';
import { featureStore, WidgetFeature } from '@/store/features';

import widget from './BuilderWidget.vue';
import { typeName } from './getters';
import specs from './specs';
import { builderStore } from './store';
import { BuilderConfig } from './types';

const feature: WidgetFeature<BuilderConfig> = {
  id: typeName,
  title: 'Brewery Builder',
  component: ref(widget),
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

export default {
  install(Vue: VueConstructor) {
    Vue.$startup.onStart(() => builderStore.start());

    autoRegister(require.context('./components', true, /[A-Z]\w+\.vue$/));
    autoRegister(require.context('./parts', true, /[A-Z]\w+\.vue$/));

    builderStore.registerParts(Object.values(specs));
    featureStore.registerWidget(feature);
  },
};
