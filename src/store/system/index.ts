import { defaults, omit } from 'lodash';
import { Action, Module, Mutation, VuexModule } from 'vuex-class-modules';

import { StoreObject } from '@/shared-types';
import store from '@/store';

import { configApi, globalApi } from './api';
import { SystemConfig, UserUnits } from './types';

export * from './types';
export * from './helpers';

const CONFIG_ID = 'default';
const UNITS_ID = 'units';

const defaultConfig = (): SystemConfig => ({
  keyboardLayout: 'english',
  experimental: false,
  showSidebarLayouts: true,
  homePage: null,
  builderTouchDelayed: 'dense',
});

const defaultUnits = (): UserUnits => ({
  temperature: 'degC',
});

@Module // generateMutationSetters not set
export class SystemModule extends VuexModule {
  public loaded: boolean = false;
  public now: Date = new Date();
  public config: SystemConfig = defaultConfig();
  public units: UserUnits = defaultUnits();

  public userDefinedUnits: boolean = true; // assume yes

  @Mutation
  public setLoaded(): void {
    this.loaded = true;
  }

  @Mutation
  public updateTime(): void {
    this.now = new Date();
  }

  @Mutation
  private updateConfig(cfg: SystemConfig & Partial<StoreObject> | null): void {
    this.config = omit(defaults(cfg, defaultConfig()), 'id', 'namespace');
  }

  @Mutation
  private updateUnits(units: UserUnits & Partial<StoreObject> | null): void {
    this.units = omit(defaults(units, defaultUnits()), 'id', 'namespace');
    this.userDefinedUnits = units !== null;
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
  public async start(): Promise<void> {
    // Every time updateTime() is called, it will trigger a reactive update.
    setInterval(() => this.updateTime(), 10 * 1000);

    this.updateConfig(await configApi.fetchById(CONFIG_ID));
    this.updateUnits(await globalApi.fetchById(UNITS_ID));

    configApi.subscribe(
      obj => obj.id === CONFIG_ID && this.updateConfig(obj),
      id => id === CONFIG_ID && this.updateConfig(defaultConfig())
    );

    globalApi.subscribe(
      obj => obj.id === UNITS_ID && this.updateUnits(obj),
      id => id === UNITS_ID && this.updateUnits(defaultUnits())
    );
  }
}

export const systemStore = new SystemModule({ store, name: 'system' });
