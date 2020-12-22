import { VueConstructor } from 'vue';

import { featureStore } from '@/store/features';

import EventControlled from './EventControlled';
import { eventControlStore } from './store';

export default {
  install(Vue: VueConstructor) {
    featureStore.registerWidget(EventControlled);

    Vue.$startup.onStart(() => eventControlStore.start());
  },
};
