import { VueConstructor } from 'vue';

import { BrewbloxRedisImpl, checkDatastore } from './redis-database';

export * from './types';

export default {
  install(Vue: VueConstructor) {
    Vue.$database = new BrewbloxRedisImpl();
    Vue.$startup.onStart(checkDatastore);
  },
};
