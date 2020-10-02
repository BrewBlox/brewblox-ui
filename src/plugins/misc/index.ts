import { featureStore } from '@/store/features';

import Stopwatch from './Stopwatch';

export default {
  install() {
    featureStore.registerWidget(Stopwatch);
  },
};
