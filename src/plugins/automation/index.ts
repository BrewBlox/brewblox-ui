import { VueConstructor } from 'vue';

import { autoRegister } from '@/helpers/component-ref';
import { featureStore, WatcherFeature } from '@/store/features';

import Automation from './Automation';
import { automationStore } from './store';

const watcher: WatcherFeature = {
  id: 'AutomationWatcher',
  component: 'AutomationWatcher',
  props: {},
};

export default {
  install(Vue: VueConstructor) {
    if (!process.env.BLOX_FEATURE_AUTOMATION) {
      return;
    }
    autoRegister(require.context('./components', true, /[A-Z]\w+\.vue$/));

    featureStore.registerWidget(Automation.feature);
    featureStore.registerWatcher(watcher);

    Vue.$startup.onStart(() => automationStore.start());
  },
};
