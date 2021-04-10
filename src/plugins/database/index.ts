import { Plugin } from 'vue';

import { DatabaseKey } from '@/symbols';

import { BrewbloxRedisDatabase } from './database';
import { BrewbloxDatabase } from './types';

export * from './types';

export const database: BrewbloxDatabase = new BrewbloxRedisDatabase();

export const databasePlugin: Plugin = {
  install(app) {
    app.provide(DatabaseKey, database);
  },
};
