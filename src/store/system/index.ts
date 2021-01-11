import { omit } from 'lodash';
import Vue from 'vue';
import { Action, Module, Mutation, VuexModule } from 'vuex-class-modules';

import { intercept } from '@/helpers/http';
import { StoreObject } from '@/shared-types';
import store from '@/store';

import { SystemConfig } from './types';

export * from './types';

const DB_MODULE_ID = 'system-config';
const DB_OBJ_ID = 'default';

const defaultSettings = (): SystemConfig => ({
  keyboardLayout: 'english',
  experimental: false,
  showSidebarLayouts: true,
  homePage: null,
  builderTouchDelayed: 'dense',
});

const persistConfig = async (settings: SystemConfig): Promise<SystemConfig> =>
  Vue.$database
    .persist(DB_MODULE_ID, { ...settings, id: DB_OBJ_ID })
    .then(obj => omit(obj, 'id'))
    .catch(intercept('Failed to save system config'));

const fetchConfig = async (): Promise<SystemConfig> =>
  Vue.$database
    .fetchById<SystemConfig & StoreObject>(DB_MODULE_ID, DB_OBJ_ID)
    .then(settings => {
      return {
        ...defaultSettings(),
        ...omit(settings, 'id'),
      };
    })
    .catch(() => defaultSettings());

@Module // generateMutationSetters not set
export class SystemModule extends VuexModule {
  public loaded: boolean = false;
  public now: Date = new Date();
  public config: SystemConfig = defaultSettings();

  @Mutation
  public setLoaded(): void {
    this.loaded = true;
  }

  @Mutation
  public updateTime(): void {
    this.now = new Date();
  }

  @Mutation
  private updateConfig(cfg: SystemConfig): void {
    this.config = cfg;
  }

  @Action
  public async saveConfig(patch: Partial<SystemConfig>): Promise<void> {
    this.updateConfig({
      ...this.config,
      ...patch,
    });
    await persistConfig(this.config);
  }

  @Action
  public async start(): Promise<void> {
    // Every time updateTime() is called, it will trigger a reactive update.
    setInterval(() => this.updateTime(), 10 * 1000);
    this.updateConfig(await fetchConfig());
  }
}

export const systemStore = new SystemModule({ store, name: 'system' });
