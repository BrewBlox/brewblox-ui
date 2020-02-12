import Vue from 'vue';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';

import { objReducer } from '@/helpers/functional';
import { StoreObject } from '@/plugins/database';
import store from '@/store';

import api from './api';

export interface UIPlugin extends StoreObject {
  id: string;
  title: string;
  url: string;
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
}

export const pluginStore = getModule(PluginModule);
