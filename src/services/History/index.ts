import { FeatureService } from '@/services/state';
import { register } from './store';

import Metrics from './Metrics';

const service: FeatureService = {
  register,
  features: {
    Metrics,
  },
};

export default service;
