import { VueConstructor } from 'vue';

import { autoRegister } from '@/helpers/component-ref';
import { featureStore, WidgetFeature } from '@/store/features';

import features from './features';
import { sparkType } from './getters';
import { installFilters } from './helpers';
import { sparkStore } from './store';
import { BlockSpec } from './types';

// Allows lookups based on the old type ID
// DeprecatedWidget will update the widget in the datastore
const deprecated: WidgetFeature[] = [
  {
    id: 'StepView',
    title: 'Step View',
    component: 'DeprecatedWidget',
    wizard: false,
    widgetSize: { cols: 0, rows: 0 },
  },
];

export default {
  install(Vue: VueConstructor) {
    installFilters(Vue);

    autoRegister(require.context('./components', true, /[A-Z]\w+\.vue$/));
    autoRegister(require.context('./service', true, /[A-Z]\w+\.vue$/));

    deprecated.forEach(featureStore.registerWidget);

    Object.values(features)
      .forEach(feature => featureStore.registerWidget(feature.feature));

    const specs = Object.values(features)
      .filter(spec => !!spec.block)
      .map(spec => spec.block) as BlockSpec[];

    sparkStore.commitAllSpecs(specs);

    featureStore.registerWatcher({
      id: 'SparkWatcher',
      component: 'SparkWatcher',
      props: {},
    });

    featureStore.registerService({
      id: sparkType,
      title: 'Spark Controller',
      onStart: service => sparkStore.addService(service.id),
      onRemove: service => sparkStore.removeService(service.id),
      wizard: 'SparkWizard',
      page: 'SparkPage',
    });

    Vue.$startup.onStart(() => sparkStore.start());
  },
};
