import { VueConstructor } from 'vue';

import { autoRegister } from '@/helpers/component-ref';
import { Feature, featureStore } from '@/store/features';
import { pluginStore } from '@/store/plugins';
import { providerStore } from '@/store/providers';

import features from './features';
import { typeName } from './getters';
import { installFilters } from './helpers';
import { sparkStore } from './store';
import { BlockSpec } from './types';

// Allows lookups based on the old type ID
// DeprecatedWidget will update the widget in the datastore
const deprecated: Feature[] = [
  {
    id: 'StepView',
    displayName: 'Step View',
    widgetComponent: 'DeprecatedWidget',
    widgetSize: { cols: 0, rows: 0 },
    wizardComponent: null,
  },
];

export default {
  install(Vue: VueConstructor) {
    installFilters(Vue);

    autoRegister(require.context('./components', true, /[A-Z]\w+\.vue$/));
    autoRegister(require.context('./provider', true, /[A-Z]\w+\.vue$/));

    deprecated.forEach(featureStore.createFeature);

    Object.values(features)
      .forEach(feature => featureStore.createFeature(feature.feature));

    const specs = Object.values(features)
      .filter(spec => !!spec.block)
      .map(spec => spec.block) as BlockSpec[];

    sparkStore.commitAllSpecs(specs);
    pluginStore.onSetup('spark/setup');

    providerStore.createProvider({
      id: typeName,
      displayName: 'Spark Controller',
      features: Object.keys(features),
      onAdd: service => sparkStore.addService(service.id),
      onRemove: service => sparkStore.removeService(service.id),
      onFetch: service => sparkStore.fetchSettings(service.id),
      wizard: 'SparkWizard',
      page: 'SparkPage',
      watcher: 'SparkWatcher',
    });
  },
};
