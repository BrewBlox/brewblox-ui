import { VueConstructor } from 'vue';

import { BrewbloxCouchDBDatabase } from './couchdb-database';
import { BrewbloxRedisDatabase } from './redis-database';

const redisEnabled = process.env.BLOX_FEATURE_REDIS;

export * from './types';

export default {
  install(Vue: VueConstructor) {
    Vue.$database = redisEnabled
      ? new BrewbloxRedisDatabase()
      : new BrewbloxCouchDBDatabase();
    Vue.$startup.onStart(Vue.$database.start);
  },
};
