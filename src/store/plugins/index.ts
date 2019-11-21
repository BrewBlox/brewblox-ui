import Vue from 'vue';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';

import { objReducer } from '@/helpers/functional';
import store from '@/store';

import api from './api';

export interface UIPlugin {
  id: string;
  title: string;
  url: string;
  _rev?: string;
}

export interface UIPluginResult {
  id: string;
  loaded: boolean;
  error: string | null;
}

const defaultResult = (plugin: UIPlugin): UIPluginResult =>
  ({ id: plugin.id, loaded: false, error: null });

const rawError = true;

@Module({ store, namespaced: true, dynamic: true, name: 'plugins' })
export class PluginModule extends VuexModule {
  private setupActions: string[] = [];
  public plugins: Mapped<UIPlugin> = {};
  public results: Mapped<UIPluginResult> = {};

  public get pluginValues(): UIPlugin[] {
    return Object.values(this.plugins);
  }

  @Mutation
  public commitPlugin(plugin: UIPlugin): void {
    Vue.set(this.plugins, plugin.id, plugin);
    Vue.set(this.results, plugin.id, defaultResult(plugin));
  }

  @Mutation
  public commitAllPlugins(plugins: UIPlugin[]): void {
    this.plugins = plugins.reduce(objReducer('id'), {});
    this.results = plugins
      .map(defaultResult)
      .reduce(objReducer('id'), {});
  }

  @Mutation
  public commitRemovePlugin(plugin: UIPlugin): void {
    Vue.delete(this.plugins, plugin.id);
    Vue.delete(this.results, plugin.id);
  }

  @Mutation
  public commitResult(result: UIPluginResult): void {
    Vue.set(this.results, result.id, result);
  }

  @Mutation
  private commitSetupActions(actions: string[]): void {
    this.setupActions = [...actions];
  }

  @Action({ rawError })
  public async fetchPlugins(): Promise<UIPlugin[]> {
    const plugins = await api.fetch();
    this.commitAllPlugins(plugins);
    return plugins;
  }

  @Action({ rawError })
  public async createPlugin(plugin: UIPlugin): Promise<void> {
    this.commitPlugin(await api.create(plugin));
  }

  @Action({ rawError })
  public async savePlugin(plugin: UIPlugin): Promise<void> {
    this.commitPlugin(await api.persist(plugin));
  }

  @Action({ rawError })
  public async removePlugin(plugin: UIPlugin): Promise<void> {
    await api.remove(plugin);
    this.commitRemovePlugin(plugin);
  }

  @Action({ rawError })
  public async onSetup(action: string): Promise<void> {
    this.commitSetupActions([...this.setupActions, action]);
  }

  @Action({ rawError })
  public async setup(): Promise<void> {
    await Promise.all(
      this.setupActions
        .map(a => store.dispatch(a)));
  }

  @Action({ rawError })
  public async init(): Promise<void> {
    this.commitSetupActions([]);
    api.setup(() => { }, () => { });
  }
}

export const pluginStore = getModule(PluginModule);
