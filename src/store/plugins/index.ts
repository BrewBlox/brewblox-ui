import Vue from 'vue';
import { Action, Module, Mutation, VuexModule, getModule } from 'vuex-module-decorators';

import { objReducer } from '@/helpers/functional';
import store from '@/store';

import {
  createPlugin as createPluginInApi,
  deletePlugin as removePluginInApi,
  fetchPlugins as fetchPluginsInApi,
  persistPlugin as persistPluginInApi,
  setup as setupInApi,
} from './api';

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
  public plugins: Record<string, UIPlugin> = {};
  public results: Record<string, UIPluginResult> = {};

  public get pluginValues(): UIPlugin[] {
    return Object.values(this.plugins);
  }

  @Mutation
  public commitPlugin(plugin: UIPlugin) {
    Vue.set(this.plugins, plugin.id, plugin);
    Vue.set(this.results, plugin.id, defaultResult(plugin));
  }

  @Mutation
  public commitAllPlugins(plugins: UIPlugin[]) {
    this.plugins = plugins.reduce(objReducer('id'), {});
    this.results = plugins
      .map(defaultResult)
      .reduce(objReducer('id'), {});
  }

  @Mutation
  public commitRemovePlugin(plugin: UIPlugin) {
    Vue.delete(this.plugins, plugin.id);
    Vue.delete(this.results, plugin.id);
  }

  @Mutation
  public commitResult(result: UIPluginResult) {
    Vue.set(this.results, result.id, result);
  }

  @Action({ rawError })
  public async fetchPlugins(): Promise<UIPlugin[]> {
    const plugins = await fetchPluginsInApi();
    this.commitAllPlugins(plugins);
    return plugins;
  }

  @Action({ rawError })
  public async createPlugin(plugin: UIPlugin) {
    this.commitPlugin(await createPluginInApi(plugin));
  }

  @Action({ rawError })
  public async savePlugin(plugin: UIPlugin) {
    this.commitPlugin(await persistPluginInApi(plugin));
  }

  @Action({ rawError })
  public async removePlugin(plugin: UIPlugin) {
    await removePluginInApi(plugin);
    this.commitRemovePlugin(plugin);
  }

  @Action({ rawError })
  public async setup() {
    setupInApi(() => { }, () => { });
  }
}

export const pluginStore = getModule(PluginModule);
