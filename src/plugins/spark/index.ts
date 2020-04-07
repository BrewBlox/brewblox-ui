import { uid } from 'quasar';
import { VueConstructor } from 'vue';

import { autoRegister } from '@/helpers/component-ref';
import { featureStore, WidgetFeature } from '@/store/features';
import { serviceStore } from '@/store/services';

import features from './features';
import { sparkStatusEvent, sparkType } from './getters';
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

    sparkStore.registerSpecs(specs);

    featureStore.registerWatcher({
      id: 'SparkWatcher',
      component: 'SparkWatcher',
      props: {},
    });

    featureStore.registerService({
      id: sparkType,
      title: 'Spark Service',
      page: 'SparkPage',
      onStart: service => sparkStore.addService(service.id),
      onRemove: service => sparkStore.removeService(service.id),
      wizard: stub => ({
        ...stub,
        title: stub.id,
        order: 0,
        config: {
          groupNames: [],
          expandedBlocks: {},
          sorting: 'unsorted',
          pageMode: 'List',
        },
      }),
    });

    Vue.$startup.onStart(() => sparkStore.start());
    Vue.$startup.onStart(() => {
      Vue.$eventbus.addListener({
        id: uid(),
        filter: (_, type) => type === sparkStatusEvent,
        onmessage: msg => serviceStore.ensureStub({ id: msg.key, type: sparkType }),
      });
    });
  },
};
