import { Plugin } from 'vue';

import { STATE_TOPIC } from '@/const';
import { eventbus } from '@/eventbus';
import { startup } from '@/startup';
import { WidgetFeature, useFeatureStore } from '@/store/features';
import { useServiceStore } from '@/store/services';
import { autoRegister, cref } from '@/utils/component-ref';

import { sparkType } from './const';
import features from './features';
import SparkActions from './service/SparkActions.vue';
import SparkPage from './service/SparkPage.vue';
import SparkWatcher from './service/SparkWatcher.vue';
import { useBlockSnippetStore, useSparkStore } from './store';
import { isSparkState } from './utils';

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

const plugin: Plugin = {
  install(app) {
    const serviceStore = useServiceStore();
    const featureStore = useFeatureStore();
    const sparkStore = useSparkStore();
    const snippetStore = useBlockSnippetStore();

    autoRegister(app, require.context('./components', true));

    deprecated.forEach(featureStore.addWidgetFeature);
    features.forEach(app.use);

    featureStore.addWatcherFeature({
      id: 'SparkWatcher',
      component: cref(app, SparkWatcher),
      props: {},
    });

    featureStore.addServiceFeature({
      id: sparkType,
      title: 'Spark Service',
      pageComponent: cref(app, SparkPage),
      configComponent: cref(app, SparkActions),
      onStart: (service) => sparkStore.addService(service.id),
      onRemove: (service) => sparkStore.removeService(service.id),
      wizard: (stub) => ({
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
        serviceStore.ensureStub({ id: data.key, type: sparkType });
      }
    });

    startup.onStart(() => snippetStore.start());
  },
};

export default plugin;
