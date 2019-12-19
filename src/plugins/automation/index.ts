import { autoRegister } from '@/helpers/component-ref';
import { featureStore } from '@/store/features';
import { pluginStore } from '@/store/plugins';

import Automation from './Automation';

export default {
  install() {
    if (process.env.BLOX_FEATURE_AUTOMATION) {
      return;
    }
    autoRegister(require.context('./components', true, /[A-Z]\w+\.vue$/));

    featureStore.createFeature(Automation.feature);
    featureStore.createWatcher({ component: 'AutomationWatcher', props: {} });
    pluginStore.onSetup('automation/setup');
  },
};
