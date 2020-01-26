import Vue from 'vue';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';

import { objReducer } from '@/helpers/functional';
import store from '@/store';
import { providerStore } from '@/store/providers';

import api from './api';

export interface Service {
  id: string;
  title: string;
  order: number;
  type: string;
  config: Mapped<any>;
  _rev?: string;
}

const rawError = true;

const initService = async (service: Service): Promise<void> => {
  await providerStore.onAddById(service.type)(service);
  await providerStore.onFetchById(service.type)(service);
};

@Module({ store, namespaced: true, dynamic: true, name: 'services' })
export class ServiceModule extends VuexModule {
  public services: Mapped<Service> = {};

  public get serviceIds(): string[] {
    return Object.keys(this.services);
  }

  public get serviceValues(): Service[] {
    return Object.values(this.services);
  }

  public get serviceById(): (id: string, type?: string) => Service {
    return (id: string, type?: string) => {
      const service = this.services[id];
      if (!service) {
        throw new Error(`Service ${id} not found`);
      }
      if (service && type && service.type !== type) {
        throw new Error(`Invalid service: ${service.type} !== ${type}`);
      }
      return service;
    };
  }

  public get typedServices(): (type: string) => Service[] {
    return type => this.serviceValues.filter(svc => svc.type === type);
  }

  public get tryServiceById(): (id: string) => Service | null {
    return id => this.services[id] || null;
  }

  public get serviceExists(): (id: string) => boolean {
    return id => !!this.services[id];
  }

  @Mutation
  public commitService(service: Service): void {
    Vue.set(this.services, service.id, { ...service });
  }

  @Mutation
  public commitAllServices(services: Service[]): void {
    this.services = services.reduce(objReducer('id'), {});
  }

  @Mutation
  public commitRemoveService(service: Service): void {
    Vue.delete(this.services, service.id);
  }

  @Action({ rawError })
  public async createService(service: Service): Promise<Service> {
    const created = await api.create(service);
    this.commitService(created);
    await initService(created);
    return created;
  }

  @Action({ rawError, commit: 'commitService' })
  public async saveService(service: Service): Promise<Service> {
    return await api.persist(service);
  }

  @Action({ rawError, commit: 'commitRemoveService' })
  public async removeService(service: Service): Promise<Service> {
    await providerStore.onRemoveById(service.type)(service);
    return await api.remove(service);
  }

  @Action({ rawError })
  public async updateServiceOrder(ids: string[]): Promise<void> {
    await Promise.all(
      ids.map(async (id, idx) => {
        const service = await api.persist({ ...this.services[id], order: idx + 1 });
        this.commitService(service);
      }));
  }

  @Action({ rawError })
  public async start(): Promise<void> {
    const onChange = async (service: Service): Promise<void> => {
      const existing = this.tryServiceById(service.id);
      if (!existing) {
        this.commitService(service);
        await initService(service);
      } else if (existing._rev !== service._rev) {
        this.commitService(service);
      }
    };
    const onDelete = (id: string): void => {
      const existing = this.tryServiceById(id);
      if (existing) {
        this.removeService(existing);
      }
    };

    const services = await api.fetch();
    this.commitAllServices(services);
    await Promise.all(services.map(initService));

    api.setup(onChange, onDelete);
  }
}

export const serviceStore = getModule(ServiceModule);
