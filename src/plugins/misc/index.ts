import { featureStore } from '@/store/features';

import ConfigWatcher from './ConfigWatcher';
import Stopwatch from './Stopwatch';
import Webframe from './Webframe';

export default {
  install() {
    featureStore.registerWatcher(ConfigWatcher);
    featureStore.registerWidget(Stopwatch);
    featureStore.registerWidget(Webframe);
  },
};
