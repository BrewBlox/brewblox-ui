import { featureStore } from '@/store/features';

import Graph from './Graph';
import CurrentValue from './Metrics';

export default {
  install() {
    featureStore.createFeature(Graph);
    featureStore.createFeature(CurrentValue);
  },
};
