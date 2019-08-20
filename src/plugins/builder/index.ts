import { autoRegister, ref } from '@/helpers/component-ref';
import { Feature, featureStore } from '@/store/features';

import BuilderEditor from './BuilderEditor.vue';
import form from './BuilderForm.vue';
import widget from './BuilderWidget.vue';
import wizard from './BuilderWizard.vue';
import { typeName } from './getters';
import specs from './specs';
import { builderStore } from './store';

ref(BuilderEditor);

const feature: Feature = {
  id: typeName,
  displayName: 'Brewery Builder',
  widget: ref(widget),
  wizard: ref(wizard),
  form: ref(form),
  widgetSize: {
    cols: 8,
    rows: 8,
  },
};

// Allows lookups based on the old type ID
// DeprecatedWidget will update the widget in the datastore
const deprecated: Feature = {
  id: 'ProcessView',
  displayName: 'Process View',
  widget: 'DeprecatedWidget',
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
