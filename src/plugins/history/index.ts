import { VueConstructor } from 'vue';

import { autoRegister } from '@/helpers/component-ref';
import { featureStore } from '@/store/features';

import Graph from './Graph';
import Metrics from './Metrics';
import SessionLog from './SessionLog';
import SessionView from './SessionView';
import { historyStore } from './store';

export default {
  install(Vue: VueConstructor) {
    autoRegister(require.context('./components', true, /[A-Z]\w+\.vue$/));

    featureStore.createFeature(Graph);
    featureStore.createFeature(Metrics);
    featureStore.createFeature(SessionLog);
    featureStore.createFeature(SessionView);

    Vue.$startup.onStart(() => historyStore.start());
  },
};
