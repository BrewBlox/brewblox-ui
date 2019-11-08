import { autoRegister, ref } from '@/helpers/component-ref';
import { Feature, featureStore } from '@/store/features';

import BuilderEditor from './BuilderEditor.vue';
import widget from './BuilderWidget.vue';
import { typeName } from './getters';
import specs from './specs';
import { builderStore } from './store';

ref(BuilderEditor);

const feature: Feature = {
  id: typeName,
  displayName: 'Brewery Builder',
  widgetComponent: ref(widget),
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
const deprecated: Feature = {
  id: 'ProcessView',
  displayName: 'Process View',
  widgetComponent: 'DeprecatedWidget',
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

    featureStore.createFeature(feature);
    featureStore.createFeature(deprecated);
  },
};
