import get from 'lodash/get';
import Vue from 'vue';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';

import store from '@/store';
import { Service } from '@/store/services';

type ServiceFunc = (service: Service) => any | Promise<any>;

export interface Provider {
  id: string;
  displayName?: string;
  features: string[];
  onAdd: ServiceFunc;
  onRemove?: ServiceFunc;
  onFetch?: ServiceFunc;
  wizard?: string;
  page?: string;
  watcher?: string;
}

const rawError = true;

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
    return id => this.providers[id] || null;
  }

  public get displayName(): (id: string) => string {
    return id => get(this.providers, [id, 'displayName']) || id;
  }

  public get onAddById(): (id: string) => ServiceFunc {
    return id => get(this.providers, [id, 'onAdd']) || (async () => { });
  }

  public get onRemoveById(): (id: string) => ServiceFunc {
    return id => get(this.providers, [id, 'onRemove']) || (async () => { });
  }

  public get onFetchById(): (id: string) => ServiceFunc {
    return id => get(this.providers, [id, 'onFetch']) || (async () => { });
  }

  public get wizard(): (id: string) => string | undefined {
    return id => get(this.providers, [id, 'wizard']);
  }

  public get pageById(): (id: string) => string | undefined {
    return id => get(this.providers, [id, 'page']);
  }

  public get watcherById(): (id: string) => string | undefined {
    return id => get(this.providers, [id, 'watcher']);
  }

  public get featuresById(): (id: string) => string[] {
    return id => get(this.providers, [id, 'features']);
  }

  @Mutation
  public commitProvider(provider: Provider): void {
    Vue.set(this.providers, provider.id, { ...provider });
  }

  @Action({ rawError, commit: 'commitProvider' })
  public async createProvider(provider: Provider): Promise<Provider> {
    return provider;
  }
}

export const providerStore = getModule(ProviderModule);
