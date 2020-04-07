import isEqual from 'lodash/isEqual';
import { Action, Module, Mutation, VuexModule } from 'vuex-class-modules';

import { filterById } from '@/helpers/functional';
import store from '@/store';
import { featureStore } from '@/store/features';

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

  public serviceById(id: string): Service | null {
    return this.services.find(v => v.id === id) ?? null;
  }

  public get stubIds(): string[] {
    return this.stubs.map(v => v.id);
  }

  @Mutation
  public setService(service: Service): void {
    this.services = filterById(this.services, service, true);
    this.stubs = filterById(this.stubs, { id: service.id });
  }

  @Mutation
  public setAllServices(services: Service[]): void {
    const ids = services.map(svc => svc.id);
    this.services = services;
    this.stubs = this.stubs.filter(s => !ids.includes(s.id));
  }

  @Mutation
  public setStub(stub: ServiceStub): void {
    if (!this.serviceById(stub.id)) {
      this.stubs = filterById(this.stubs, stub, true);
    }
  }

  @Mutation
  public setStatus(status: ServiceStatus): void {
    this.statuses = filterById(this.statuses, status, true);
  }

  @Action
  public async createService(service: Service): Promise<void> {
    const created = await api.create(service);
    this.setService(created);
    await onStartService(created);
  }

  @Action
  public async appendService(service: Service): Promise<void> {
    const order = this.services.length + 1;
    await this.createService({ ...service, order });
  }

  @Action
  public async saveService(service: Service): Promise<void> {
    this.setService(await api.persist(service));
  }

  @Action
  public async removeService(service: Service): Promise<void> {
    this.services = filterById(this.services, service);
    await onRemoveService(service);
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
  public async createStub(stub: ServiceStub): Promise<void> {
    this.setStub(stub);
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
      if (!existing) {
        this.setService(service);
        await onStartService(service);
      }
      else if (existing._rev !== service._rev) {
        this.setService(service);
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
