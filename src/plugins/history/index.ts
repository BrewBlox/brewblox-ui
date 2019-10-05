import { featureStore } from '@/store/features';

import Graph from './Graph';
import Metrics from './Metrics';

export default {
  install() {
    featureStore.createFeature(Graph);
    featureStore.createFeature(Metrics);
  },
};
