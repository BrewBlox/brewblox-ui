import { Action, Module, Mutation, VuexModule } from 'vuex-class-modules';

import { extendById, filterById } from '@/helpers/functional';
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

@Module({ generateMutationSetters: true })
export class PluginModule extends VuexModule {
  public plugins: UIPlugin[] = [];
  public results: UIPluginResult[] = [];

  @Mutation
  public setPlugin(plugin: UIPlugin): void {
    this.plugins = extendById(this.plugins, plugin);
    this.results = extendById(this.results, defaultResult(plugin));
  }

  @Mutation
  public setAllPlugins(plugins: UIPlugin[]): void {
    this.plugins = plugins;
    this.results = plugins.map(defaultResult);
  }

  @Mutation
  public setResult(result: UIPluginResult): void {
    this.results = extendById(this.results, result);
  }

  @Action
  public async fetchPlugins(): Promise<UIPlugin[]> {
    const plugins = await api.fetch();
    this.setAllPlugins(plugins);
    return plugins;
  }

  @Action
  public async createPlugin(plugin: UIPlugin): Promise<void> {
    this.setPlugin(await api.create(plugin));
  }

  @Action
  public async savePlugin(plugin: UIPlugin): Promise<void> {
    this.setPlugin(await api.persist(plugin));
  }

  @Action
  public async removePlugin(plugin: UIPlugin): Promise<void> {
    await api.remove(plugin);
    this.plugins = filterById(this.plugins, plugin);
    this.results = filterById(this.results, plugin);
  }
}

export const pluginStore = new PluginModule({ store, name: 'plugins' });
