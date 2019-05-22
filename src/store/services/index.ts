import Vue from 'vue';
import store from '@/store';
import providerStore from '@/store/providers';
import { Module, VuexModule, Mutation, Action, getModule } from 'vuex-module-decorators';
import { Service } from '@/store/types';
import {
  createService as createServiceInApi,
  deleteService as removeServiceInApi,
  fetchServices as fetchServicesInApi,
  persistService as persistServiceInApi,
  setup as setupInApi,
} from './api';

const initService = async (service: Service): Promise<void> => {
  await providerStore.onAddById(service.type)(service);
  await providerStore.onFetchById(service.type)(service);
};

@Module({ store, namespaced: true, dynamic: true, name: 'services' })
export class ServiceModule extends VuexModule {
  public replicating: boolean = false;
  public services: Record<string, Service> = {};

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
    this.services = services.reduce((acc, service) => ({ ...acc, [service.id]: service }), {});
  }

  @Mutation
  public commitRemoveService(service: Service): void {
    Vue.delete(this.services, service.id);
  }

  @Action
  public async createService(service: Service): Promise<Service> {
    const created = await createServiceInApi(service);
    this.commitService(created);
    await initService(created);
    return created;
  }

  @Action({ commit: 'commitService' })
  public async saveService(service: Service): Promise<Service> {
    return await persistServiceInApi(service);
  }

  @Action({ commit: 'commitRemoveService' })
  public async removeService(service: Service): Promise<Service> {
    await providerStore.onRemoveById(service.type)(service);
    return await removeServiceInApi(service);
  }

  @Action
  public async updateServiceOrder(ids: string[]): Promise<void> {
    await Promise.all(
      ids.map(async (id, idx) => {
        const service = await persistServiceInApi({ ...this.services[id], order: idx + 1 });
        this.commitService(service);
      }));
  }

  @Action
  public async setup(): Promise<void> {
    /* eslint-disable no-underscore-dangle */
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
    /* eslint-enable no-underscore-dangle */

    const services = await fetchServicesInApi();
    this.commitAllServices(services);
    await Promise.all(services.map(initService));

    setupInApi(onChange, onDelete);
  }
}

export default getModule(ServiceModule);
