import { Plugin } from 'vue';

import { eventbus } from '@/plugins/eventbus';
import { startup } from '@/plugins/startup';
import { featureStore, WidgetFeature } from '@/store/features';
import { serviceStore } from '@/store/services';
import { autoRegister, cref } from '@/utils/component-ref';
import { STATE_TOPIC } from '@/utils/const';

import features from './features';
import { sparkType } from './getters';
import SparkActions from './service/SparkActions.vue';
import SparkPage from './service/SparkPage.vue';
import SparkWatcher from './service/SparkWatcher.vue';
import { sparkStore } from './store';
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
      onStart: service => sparkStore.addService(service.id),
      onRemove: service => sparkStore.removeService(service.id),
      wizard: stub => ({
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

    startup.onStart(() => sparkStore.start());
  },
};

export default plugin;
