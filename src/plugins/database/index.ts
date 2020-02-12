import { VueConstructor } from 'vue';

import { BrewbloxDatabaseImpl, checkDatastore } from './database';

export * from './types';

export default {
  install(Vue: VueConstructor) {
    Vue.$database = new BrewbloxDatabaseImpl();
    Vue.$startup.onStart(checkDatastore);
  },
};
