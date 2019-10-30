import { autoRegister } from '@/helpers/component-ref';
import { featureStore } from '@/store/features';

import Graph from './Graph';
import Metrics from './Metrics';
import SessionNotes from './SessionNotes';
import SessionView from './SessionView';

export default {
  install() {
    autoRegister(require.context('./components', true, /[A-Z]\w+\.vue$/));

    featureStore.createFeature(Graph);
    featureStore.createFeature(Metrics);
    featureStore.createFeature(SessionNotes);
    featureStore.createFeature(SessionView);
  },
};
