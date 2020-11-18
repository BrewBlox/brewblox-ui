import { featureStore } from '@/store/features';

import Stopwatch from './Stopwatch';
import Webframe from './Webframe';

export default {
  install() {
    featureStore.registerWidget(Stopwatch);
    featureStore.registerWidget(Webframe);
  },
};
