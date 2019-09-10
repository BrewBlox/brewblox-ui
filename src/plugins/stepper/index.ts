import { featureStore } from '@/store/features';

import Stepper from './Stepper';

export default {
  install() {
    featureStore.createFeature(Stepper.feature);
  },
};
