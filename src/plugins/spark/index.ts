import { VueConstructor } from 'vue';

import { autoRegister, ref } from '@/helpers/component-ref';
import { STATE_TOPIC } from '@/helpers/const';
import { featureStore, WidgetFeature } from '@/store/features';
import { serviceStore } from '@/store/services';

import features from './features';
import { sparkType } from './getters';
import { installFilters, isSparkState } from './helpers';
import SparkActions from './service/SparkActions.vue';
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
      pageComponent: ref(SparkPage),
      configComponent: ref(SparkActions),
      onStart: service => sparkStore.addService(service.id),
      onRemove: service => sparkStore.removeService(service.id),
      wizard: stub => ({
        ...stub,
        title: stub.id,
        order: 0,
        config: {},
      }),
    });

    Vue.$eventbus.subscribe(STATE_TOPIC + '/#');
    Vue.$eventbus.addListener(STATE_TOPIC + '/#', (_, data) => {
      if (isSparkState(data)) {
        serviceStore.ensureStub({ id: data.key, type: sparkType });
      }
    });

    Vue.$startup.onStart(() => sparkStore.start());
  },
};
