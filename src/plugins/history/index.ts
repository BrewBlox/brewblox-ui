import { autoRegister } from '@/helpers/component-ref';
import { featureStore } from '@/store/features';
import { pluginStore } from '@/store/plugins';

import Graph from './Graph';
import Metrics from './Metrics';
import SessionLog from './SessionLog';
import SessionView from './SessionView';

export default {
  install() {
    autoRegister(require.context('./components', true, /[A-Z]\w+\.vue$/));

    featureStore.createFeature(Graph);
    featureStore.createFeature(Metrics);
    featureStore.createFeature(SessionLog);
    featureStore.createFeature(SessionView);

    pluginStore.onSetup('history/setup');
  },
};
