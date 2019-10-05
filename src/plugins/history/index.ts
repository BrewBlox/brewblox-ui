import { featureStore } from '@/store/features';

import Graph from './Graph';
import Metrics from './Metrics';
import SessionView from './SessionView';

export default {
  install() {
    featureStore.createFeature(Graph);
    featureStore.createFeature(Metrics);
    featureStore.createFeature(SessionView);
  },
};
