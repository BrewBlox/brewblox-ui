import { VueConstructor } from 'vue';

import { BrewbloxRedisDatabase } from './database';

export * from './types';

export default {
  install(Vue: VueConstructor) {
    Vue.$database = new BrewbloxRedisDatabase();
  },
};
