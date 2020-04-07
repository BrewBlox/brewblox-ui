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

// Allows lookups based on the old type ID
// DeprecatedWidget will update the widget in the datastore
const deprecated: WidgetFeature = {
  id: 'ProcessView',
  title: 'Process View',
  component: 'DeprecatedWidget',
  widgetSize: { cols: 0, rows: 0 },
  wizard: false,
};

export default {
  install() {
    builderStore.setup();

    autoRegister(require.context('./components', true, /[A-Z]\w+\.vue$/));
    autoRegister(require.context('./parts', true, /[A-Z]\w+\.vue$/));

    builderStore.registerParts(Object.values(specs));

    featureStore.registerWidget(feature);
    featureStore.registerWidget(deprecated);
  },
};
