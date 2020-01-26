import { VueConstructor } from 'vue';

import { autoRegister } from '@/helpers/component-ref';
import { featureStore } from '@/store/features';

import Automation from './Automation';
import { automationStore } from './store';

export default {
  install(Vue: VueConstructor) {
    if (!process.env.BLOX_FEATURE_AUTOMATION) {
      return;
    }
    autoRegister(require.context('./components', true, /[A-Z]\w+\.vue$/));

    featureStore.createFeature(Automation.feature);
    featureStore.createWatcher({ component: 'AutomationWatcher', props: {} });

    Vue.$startup.onStart(() => automationStore.start());
  },
};
