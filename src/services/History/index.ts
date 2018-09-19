import { FeatureService } from '@/services/state';
import { register } from './store';

import Metrics from './Metrics';

import wizard from './HistoryWizard.vue';

const service: FeatureService = {
  register,
  wizard,
  displayName: 'BrewBlox History',
  features: {
    Metrics,
  },
};

export default service;
