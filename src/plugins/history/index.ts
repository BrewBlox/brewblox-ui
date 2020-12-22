import { VueConstructor } from 'vue';

import { autoRegister } from '@/helpers/component-ref';
import { featureStore } from '@/store/features';

import Graph from './Graph';
import Metrics from './Metrics';
import SessionLog from './SessionLog';
import { historyStore } from './store';

export default {
  install(Vue: VueConstructor) {
    autoRegister(require.context('./components', true));

    featureStore.registerWidget(Graph);
    featureStore.registerWidget(Metrics);
    featureStore.registerWidget(SessionLog);

    Vue.$startup.onStart(() => historyStore.start());
  },
};
