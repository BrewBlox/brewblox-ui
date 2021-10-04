import isEqual from 'lodash/isEqual';
import { defineStore } from 'pinia';

import { ServiceHook, useFeatureStore } from '@/store/features';
import { concatById, filterById, findById } from '@/utils/collections';

import api from './api';
import type { Service, ServiceStatus, ServiceStub } from './types';

export * from './types';

const onStartService: ServiceHook = (service) =>
  useFeatureStore().serviceById(service.type)?.onStart?.(service);

const onRemoveService: ServiceHook = (service) =>
  useFeatureStore().serviceById(service.type)?.onRemove?.(service);

interface ServiceStoreState {
  services: Service[];
  stubs: ServiceStub[];
  statuses: ServiceStatus[];
}

export const useServiceStore = defineStore('serviceStore', {
  state: (): ServiceStoreState => ({
    services: [],
    stubs: [],
    statuses: [],
  }),
  getters: {
    serviceIds: (state): string[] => state.services.map((v) => v.id),
    stubIds: (state): string[] => state.stubs.map((v) => v.id),
  },
  actions: {
    serviceById(id: Maybe<string>): Service | null {
      return findById(this.services, id);
    },
    setService(service: Service): void {
      this.services = concatById(this.services, service);
      this.stubs = filterById(this.stubs, service); // stubs have the same ID
    },
    setAllServices(services: Service[]): void {
      const ids = services.map((svc) => svc.id);
      this.services = services;
      this.stubs = this.stubs.filter((s) => !ids.includes(s.id));
    },
    trySetStub(stub: ServiceStub): void {
      if (!this.serviceById(stub.id)) {
        this.stubs = concatById(this.stubs, stub);
      }
    },
    setStatus(status: ServiceStatus): void {
      this.statuses = concatById(this.statuses, status);
    },
    async createService(service: Service): Promise<void> {
      await api.create(service); // triggers callback
    },
    async appendService(service: Service): Promise<void> {
      const order = this.services.length + 1;
      await this.createService({ ...service, order });
    },
    async saveService(service: Service): Promise<void> {
      await api.persist(service); // triggers callback
    },
    async removeService(service: Service): Promise<void> {
      await api.remove(service); // triggers callback
    },
    async updateServiceOrder(ids: string[]): Promise<void> {
      await Promise.all(
        ids
          .map((id) => this.serviceById(id))
          .filter((v) => v !== null)
          .map((service: Service | null, idx) =>
            this.saveService({ ...service!, order: idx + 1 }),
          ),
      );
    },
    async ensureStub(stub: ServiceStub): Promise<void> {
      this.trySetStub(stub);
    },
    async updateStatus(status: ServiceStatus): Promise<void> {
      if (!this.statuses.some((v) => isEqual(v, status))) {
        this.setStatus(status);
      }
    },
    async start(): Promise<void> {
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
    },
  },
});
