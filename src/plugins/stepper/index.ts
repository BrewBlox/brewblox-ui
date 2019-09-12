import { autoRegister } from '@/helpers/component-ref';
import { featureStore } from '@/store/features';

import Stepper from './Stepper';

export default {
  install() {
    autoRegister(require.context('./components', true, /[A-Z]\w+\.vue$/));

    featureStore.createFeature(Stepper.feature);
  },
};
