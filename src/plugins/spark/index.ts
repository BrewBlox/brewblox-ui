import { uid } from 'quasar';
import { VueConstructor } from 'vue';

import { autoRegister, ref } from '@/helpers/component-ref';
import { featureStore, WidgetFeature } from '@/store/features';
import { serviceStore } from '@/store/services';

import features from './features';
import { sparkStateEvent, sparkType } from './getters';
import { installFilters } from './helpers';
import SparkPage from './service/SparkPage.vue';
import SparkWatcher from './service/SparkWatcher.vue';
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

    autoRegister(require.context('./components', true));

    deprecated.forEach(featureStore.registerWidget);

    features
      .forEach(feature => featureStore.registerWidget(feature.feature));

    const specs = features
      .filter(f => f.block !== undefined)
      .map(f => f.block) as BlockSpec[];

    sparkStore.registerSpecs(specs);

    featureStore.registerWatcher({
      id: 'SparkWatcher',
      component: ref(SparkWatcher),
      props: {},
    });

    featureStore.registerService({
      id: sparkType,
      title: 'Spark Service',
      page: ref(SparkPage),
      onStart: service => sparkStore.addService(service.id),
      onRemove: service => sparkStore.removeService(service.id),
      wizard: stub => ({
        ...stub,
        title: stub.id,
        order: 0,
        config: {},
      }),
    });

    Vue.$startup.onStart(() => sparkStore.start());
    Vue.$startup.onStart(() => {
      Vue.$eventbus.addStateListener({
        id: uid(),
        filter: (_, type) => type === sparkStateEvent,
        onmessage: msg => serviceStore.ensureStub({ id: msg.key, type: sparkType }),
      });
    });
  },
};
