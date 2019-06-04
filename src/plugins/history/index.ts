import featureStore from '@/store/features';

import Graph from './Graph';
import CurrentValue from './Metrics';

export default () => {
  featureStore.createFeature(Graph);
  featureStore.createFeature(CurrentValue);
};
