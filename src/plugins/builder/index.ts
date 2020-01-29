import { autoRegister, selector } from '@/helpers/component-ref';
import { featureStore, WidgetFeature } from '@/store/features';

import widget from './BuilderWidget.vue';
import { typeName } from './getters';
import specs from './specs';
import { builderStore } from './store';
import { BuilderConfig } from './types';

const feature: WidgetFeature = {
  id: typeName,
  title: 'Brewery Builder',
  widgetComponent: selector(widget),
  widgetSize: {
    cols: 8,
    rows: 8,
  },
  generateConfig: (): BuilderConfig => ({
    currentLayoutId: null,
    layoutIds: [],
  }),
};

// Allows lookups based on the old type ID
// DeprecatedWidget will update the widget in the datastore
const deprecated: WidgetFeature = {
  id: 'ProcessView',
  title: 'Process View',
  widgetComponent: () => 'DeprecatedWidget',
  widgetSize: { cols: 0, rows: 0 },
  wizardComponent: null,
};

export default {
  install() {
    builderStore.setup();

    autoRegister(require.context('./components', true, /[A-Z]\w+\.vue$/));
    autoRegister(require.context('./parts', true, /[A-Z]\w+\.vue$/));

    Object.values(specs)
      .forEach(builderStore.registerPart);

    featureStore.registerWidget(feature);
    featureStore.registerWidget(deprecated);
  },
};
