import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features';
import featureStore from '@/store/features';

import form from './BuilderForm.vue';
import widget from './BuilderWidget.vue';
import wizard from './BuilderWizard.vue';
import { typeName } from './getters';
import { parts } from './register';
import { BuilderConfig } from './types';

const feature: Feature = {
  id: typeName,
  displayName: 'Brewery Builder',
  widget: ref(widget),
  wizard: ref(wizard),
  form: ref(form),
  validator: (config: BuilderConfig) =>
    config.parts.every(part => parts.includes(part.type)),
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

export default () => {
  featureStore.createFeature(feature);
  featureStore.createFeature(deprecated);
};
