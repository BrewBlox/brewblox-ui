import defaults from 'lodash/defaults';
import omit from 'lodash/omit';
import { Action, Module, Mutation, VuexModule } from 'vuex-class-modules';

import { StoreObject, StoreObjectImpl } from '@/shared-types';
import store from '@/store';

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

@Module({ generateMutationSetters: true })
export class SystemModule extends VuexModule {
  public startupDone = false;

  public config: SystemConfig = defaultConfig();
  public units: UserUnits = defaultUnits();
  public timeZone: UserTimeZone = defaultTimeZone();

  public userDefinedUnits = true; // assume yes

  @Mutation
  private updateConfig(cfg: Maybe<StoreObjectImpl<SystemConfig>>): void {
    this.config = unwrap(cfg, defaultConfig());
  }

  @Mutation
  private updateUnits(units: Maybe<StoreObjectImpl<UserUnits>>): void {
    this.units = unwrap(units, defaultUnits());
    this.userDefinedUnits = units != null;
  }

  @Mutation
  private updateTimezone(tz: Maybe<StoreObjectImpl<UserTimeZone>>): void {
    this.timeZone = unwrap(tz, defaultTimeZone());
  }

  @Action
  public async saveConfig(patch: Partial<SystemConfig>): Promise<void> {
    // Triggers callback
    await configApi.persist({
      ...this.config,
      ...patch,
      id: CONFIG_ID,
    });
  }

  @Action
  public async saveUnits(patch: Partial<UserUnits>): Promise<void> {
    // Triggers callback
    await globalApi.persist({
      ...this.units,
      ...patch,
      id: UNITS_ID,
    });
  }

  @Action
  public async saveTimeZone(patch: Partial<UserTimeZone>): Promise<void> {
    // Triggers callback
    await globalApi.persist({
      ...this.timeZone,
      ...patch,
      id: TIMEZONE_ID,
    });
  }

  @Action
  public async start(): Promise<void> {
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
  }
}

export const systemStore = new SystemModule({ store, name: 'system' });
