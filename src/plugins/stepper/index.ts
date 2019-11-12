import { autoRegister } from '@/helpers/component-ref';
import { featureStore } from '@/store/features';

import Stepper from './Stepper';

export default {
  install() {
    if (process.env.VUE_APP_STEPPER_FEATURE !== 'true') {
      return;
    }
    autoRegister(require.context('./components', true, /[A-Z]\w+\.vue$/));

    featureStore.createFeature(Stepper.feature);
    featureStore.createWatcher({ component: 'StepperWatcher', props: {} });
  },
};
