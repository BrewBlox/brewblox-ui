import Vue from 'vue';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';

import { objReducer } from '@/helpers/functional';
import store from '@/store';
import { featureStore } from '@/store/features';

import api from './api';
import { Service } from './types';

export * from './types';

const rawError = true;

const onStartService = (service: Service): Promise<void> =>
  featureStore.services[service.type]?.onStart?.(service);

const onRemoveService = (service: Service): Promise<void> =>
  featureStore.services[service.type]?.onRemove?.(service);


@Module({ store, namespaced: true, dynamic: true, name: 'services' })
export class ServiceModule extends VuexModule {
  public services: Mapped<Service> = {};

  public get serviceIds(): string[] {
    return Object.keys(this.services);
  }

  public get serviceValues(): Service[] {
    return Object.values(this.services);
  }

  public get serviceById(): (id: string) => Service {
    return id => this.services[id] ?? null;
  }

  public get typedServices(): (type: string) => Service[] {
    return type => this.serviceValues.filter(svc => svc.type === type);
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
  public async createService(service: Service): Promise<void> {
    const created = await api.create(service);
    this.commitService(created);
    await onStartService(created);
  }

  @Action({ rawError })
  public async saveService(service: Service): Promise<void> {
    this.commitService(await api.persist(service));
  }

  @Action({ rawError })
  public async removeService(service: Service): Promise<void> {
    await onRemoveService(service);
    this.commitRemoveService(await api.remove(service));
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
      const existing = this.serviceById(service.id);
      if (!existing) {
        this.commitService(service);
        await onStartService(service);
      }
      else if (existing._rev !== service._rev) {
        this.commitService(service);
      }
    };
    const onDelete = async (id: string): Promise<void> => {
      const existing = this.serviceById(id);
      if (existing) {
        await onRemoveService(existing);
        this.commitRemoveService(existing);
      }
    };

    const services = await api.fetch();
    this.commitAllServices(services);
    await Promise.all(services.map(onStartService));

    api.subscribe(onChange, onDelete);
  }
}

export const serviceStore = getModule(ServiceModule);
