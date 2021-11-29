import defaults from 'lodash/defaults';
import omit from 'lodash/omit';
import { defineStore } from 'pinia';

import { StoreObject, StoreObjectImpl } from '@/shared-types';

import { configApi, globalApi } from './api';
import { SystemConfig, UserTimeZone, UserUnits } from './types';

export * from './types';
export * from './utils';

const CONFIG_ID = 'default';
const UNITS_ID = 'units';
const TIMEZONE_ID = 'timeZone';

const defaultConfig = (): StoreObjectImpl<SystemConfig> => ({
  id: CONFIG_ID,
  keyboardLayout: 'english',
  experimental: false,
  showSidebarLayouts: true,
  homePage: null,
  builderTouchDelayed: 'dense',
});

const defaultUnits = (): StoreObjectImpl<UserUnits> => ({
  id: UNITS_ID,
  temperature: 'degC',
  gravity: 'G',
});

const defaultTimeZone = (): StoreObjectImpl<UserTimeZone> => ({
  id: TIMEZONE_ID,
  name: 'Etc/UTC',
  posixValue: 'UTC0',
});

const unitsFilter = (v: StoreObject): v is StoreObjectImpl<UserUnits> =>
  v.id === UNITS_ID;

const timeZoneFilter = (v: StoreObject): v is StoreObjectImpl<UserTimeZone> =>
  v.id === TIMEZONE_ID;

function unwrap<T extends StoreObject>(
  value: Maybe<T>,
  fallback: T,
): Omit<T, 'id' | 'namespace'> {
  return omit(defaults(value, fallback), 'id', 'namespace');
}

interface SystemStoreState {
  startupDone: boolean;
  config: SystemConfig;
  units: UserUnits;
  timeZone: UserTimeZone;
  userDefinedUnits: boolean;
}

export const useSystemStore = defineStore('systemStore', {
  state: (): SystemStoreState => ({
    startupDone: false,
    config: defaultConfig(),
    units: defaultUnits(),
    timeZone: defaultTimeZone(),
    userDefinedUnits: true, // assume yes
  }),
  actions: {
    updateConfig(cfg: Maybe<StoreObjectImpl<SystemConfig>>): void {
      this.config = unwrap(cfg, defaultConfig());
    },

    updateUnits(units: Maybe<StoreObjectImpl<UserUnits>>): void {
      this.units = unwrap(units, defaultUnits());
      this.userDefinedUnits = units != null;
    },

    updateTimezone(tz: Maybe<StoreObjectImpl<UserTimeZone>>): void {
      this.timeZone = unwrap(tz, defaultTimeZone());
    },

    async saveConfig(patch: Partial<SystemConfig>): Promise<void> {
      // Triggers callback
      await configApi.persist({
        ...this.config,
        ...patch,
        id: CONFIG_ID,
      });
    },

    async saveUnits(patch: Partial<UserUnits>): Promise<void> {
      // Triggers callback
      await globalApi.persist({
        ...this.units,
        ...patch,
        id: UNITS_ID,
      });
    },

    async saveTimeZone(patch: Partial<UserTimeZone>): Promise<void> {
      // Triggers callback
      await globalApi.persist({
        ...this.timeZone,
        ...patch,
        id: TIMEZONE_ID,
      });
    },

    async start(): Promise<void> {
      this.updateConfig(await configApi.fetchById(CONFIG_ID));
      const globalValues = await globalApi.fetch();

      this.updateUnits(globalValues.find(unitsFilter));
      this.updateTimezone(globalValues.find(timeZoneFilter));

      configApi.subscribe(
        (obj) => obj.id === CONFIG_ID && this.updateConfig(obj),
        (id) => id === CONFIG_ID && this.updateConfig(defaultConfig()),
      );

      globalApi.subscribe(
        (obj) => {
          if (unitsFilter(obj)) {
            this.updateUnits(obj);
          } else if (timeZoneFilter(obj)) {
            this.updateTimezone(obj);
          }
        },
        (id) => {
          if (id === UNITS_ID) {
            this.updateUnits(defaultUnits());
          } else if (id === TIMEZONE_ID) {
            this.updateTimezone(defaultTimeZone());
          }
        },
      );
    },
  },
});
