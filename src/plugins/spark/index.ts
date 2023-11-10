import { Plugin } from 'vue';
import { STATE_TOPIC } from '@/const';
import { eventbus } from '@/eventbus';
import { startup } from '@/startup';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { useServiceStore } from '@/store/services';
import { cref, globRegister } from '@/utils/component-ref';
import { SPARK_SERVICE_TYPE } from './const';
import features from './features';
import SparkActions from './service/SparkActions.vue';
import SparkPage from './service/SparkPage.vue';
import SparkWatcher from './service/SparkWatcher.vue';
import { useBlockSnippetStore, useSparkStore } from './store';
import { isSparkState } from './utils/info';

// Allows lookups based on the old type ID
// DeprecatedWidget will update the widget in the datastore
const deprecated: WidgetFeature[] = [
  {
    id: 'StepView',
    title: 'Step View',
    component: 'DeprecatedWidget',
    creatable: false,
    widgetSize: { cols: 0, rows: 0 },
  },
];

const plugin: Plugin = {
  install(app) {
    const serviceStore = useServiceStore();
    const featureStore = useFeatureStore();
    const sparkStore = useSparkStore();
    const snippetStore = useBlockSnippetStore();

    globRegister(
      app,
      import.meta.glob('./components/**/*.vue', { eager: true }),
    );

    deprecated.forEach(featureStore.addWidgetFeature);
    features.forEach(app.use);

    featureStore.addWatcherFeature({
      id: 'SparkWatcher',
      component: cref(app, SparkWatcher),
      props: {},
    });

    featureStore.addServiceFeature({
      id: SPARK_SERVICE_TYPE,
      title: 'Spark Service',
      pageComponent: cref(app, SparkPage),
      configComponent: cref(app, SparkActions),
      onStart: (service) => sparkStore.addService(service.id),
      onRemove: (service) => sparkStore.removeService(service.id),
      generate: (stub) => ({
        ...stub,
        title: stub.id,
        order: 0,
        config: {},
      }),
    });

    // Basic spark state
    eventbus.subscribe(`${STATE_TOPIC}/+`);
    // Patch events
    eventbus.subscribe(`${STATE_TOPIC}/+/patch`);
    // Firmware update events
    eventbus.subscribe(`${STATE_TOPIC}/+/update`);

    eventbus.addListener(`${STATE_TOPIC}/+`, (_, data) => {
      if (isSparkState(data)) {
        serviceStore.ensureStub({ id: data.key, type: SPARK_SERVICE_TYPE });
      }
    });

    startup.add(snippetStore);
  },
};

export default plugin;
