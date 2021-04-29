import { BrewbloxRedisDatabase } from './database';
import { BrewbloxDatabase } from './types';

export * from './types';

export const database: BrewbloxDatabase = new BrewbloxRedisDatabase();
