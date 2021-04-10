import isEqual from 'lodash/isEqual';
import { Action, Module, Mutation, VuexModule } from 'vuex-class-modules';

import store from '@/store';
import { featureStore } from '@/store/features';
import { extendById, filterById, findById } from '@/utils/functional';

import api from './api';
import { Service, ServiceStatus, ServiceStub } from './types';

export * from './types';

const onStartService = (service: Service): Promise<void> =>
  featureStore.serviceById(service.type)?.onStart?.(service);

const onRemoveService = (service: Service): Promise<void> =>
  featureStore.serviceById(service.type)?.onRemove?.(service);


@Module({ generateMutationSetters: true })
export class ServiceModule extends VuexModule {
  public services: Service[] = [];
  public stubs: ServiceStub[] = [];
  public statuses: ServiceStatus[] = [];

  public get serviceIds(): string[] {
    return this.services.map(v => v.id);
  }

  public serviceById(id: string | null): Service | null {
    return findById(this.services, id);
  }

  public get stubIds(): string[] {
    return this.stubs.map(v => v.id);
  }

  @Mutation
  public setService(service: Service): void {
    this.services = extendById(this.services, service);
    this.stubs = filterById(this.stubs, service); // stubs have the same ID
  }

  @Mutation
  public setAllServices(services: Service[]): void {
    const ids = services.map(svc => svc.id);
    this.services = services;
    this.stubs = this.stubs.filter(s => !ids.includes(s.id));
  }

  @Mutation
  public trySetStub(stub: ServiceStub): void {
    if (!this.serviceById(stub.id)) {
      this.stubs = extendById(this.stubs, stub);
    }
  }

  @Mutation
  public setStatus(status: ServiceStatus): void {
    this.statuses = extendById(this.statuses, status);
  }

  @Action
  public async createService(service: Service): Promise<void> {
    await api.create(service); // triggers callback
  }

  @Action
  public async appendService(service: Service): Promise<void> {
    const order = this.services.length + 1;
    await this.createService({ ...service, order });
  }

  @Action
  public async saveService(service: Service): Promise<void> {
    await api.persist(service); // triggers callback
  }

  @Action
  public async removeService(service: Service): Promise<void> {
    await api.remove(service); // triggers callback
  }

  @Action
  public async updateServiceOrder(ids: string[]): Promise<void> {
    await Promise.all(
      ids
        .map(id => this.serviceById(id))
        .filter(v => v !== null)
        .map((service: Service | null, idx) => this.saveService({ ...service!, order: idx + 1 })));
  }

  @Action
  public async ensureStub(stub: ServiceStub): Promise<void> {
    this.trySetStub(stub);
  }

  @Action
  public async updateStatus(status: ServiceStatus): Promise<void> {
    if (!this.statuses.some(v => isEqual(v, status))) {
      this.setStatus(status);
    }
  }

  @Action
  public async start(): Promise<void> {
    const onChange = async (service: Service): Promise<void> => {
      const existing = this.serviceById(service.id);
      this.setService(service);
      if (!existing) {
        await onStartService(service);
      }
    };
    const onDelete = async (id: string): Promise<void> => {
      const existing = this.serviceById(id);
      if (existing) {
        await onRemoveService(existing);
        this.services = filterById(this.services, existing);
      }
    };

    const services = await api.fetch();
    this.setAllServices(services);
    await Promise.all(services.map(onStartService));

    api.subscribe(onChange, onDelete);
  }
}

export const serviceStore = new ServiceModule({ store, name: 'services' });
