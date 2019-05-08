import Vue from 'vue';
import store from '@/store';
import { Module, VuexModule, Mutation, Action, getModule } from 'vuex-module-decorators';
import get from 'lodash/get';
import { Provider } from './state';
import { Service } from '../services/state';

type ServiceFunc = (service: Service) => Promise<any>;

@Module({ store, namespaced: true, dynamic: true, name: 'providers' })
export class ProviderModule extends VuexModule {
  public providers: Record<string, Provider> = {};

  public get providerIds(): string[] {
    return Object.keys(this.providers);
  }

  public get providerValues(): Provider[] {
    return Object.values(this.providers);
  }

  public get providerById(): (id: string) => Provider | null {
    return (id: string) => this.providers[id] || null;
  }

  public get displayNameById(): (id: string) => string {
    return (id: string) => get(this.providers, [id, 'displayName'], id);
  }

  public get initializerById(): (id: string) => ServiceFunc {
    return (id: string) => get(this.providers, [id, 'initializer'], async () => { });
  }

  public get fetcherById(): (id: string) => ServiceFunc {
    return (id: string) => get(this.providers, [id, 'fetcher'], async () => { });
  }

  public get wizardById(): (id: string) => string | undefined {
    return (id: string) => get(this.providers, [id, 'wizard']);
  }

  public get pageById(): (id: string) => string | undefined {
    return (id: string) => get(this.providers, [id, 'page']);
  }

  public get watcherById(): (id: string) => string | undefined {
    return (id: string) => get(this.providers, [id, 'watcher']);
  }

  public get featuresById(): (id: string) => string[] {
    return (id: string) => get(this.providers, [id, 'features']);
  }

  @Mutation
  public commitProvider(provider: Provider): void {
    Vue.set(this.providers, provider.id, { ...provider });
  }

  @Action({ commit: 'commitProvider' })
  public async createProvider(provider: Provider): Promise<Provider> {
    return provider;
  }
}

export default getModule(ProviderModule);
