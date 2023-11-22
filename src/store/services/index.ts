import isEqual from 'lodash/isEqual';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { ServiceHook, useFeatureStore } from '@/store/features';
import { concatById, filterById, findById } from '@/utils/collections';
import api from './api';
import type { Service, ServiceStatus, ServiceStub } from './types';

export * from './types';

const onStartService: ServiceHook = (service) =>
  useFeatureStore().serviceById(service.type)?.onStart?.(service);

const onRemoveService: ServiceHook = (service) =>
  useFeatureStore().serviceById(service.type)?.onRemove?.(service);

export const useServiceStore = defineStore('serviceStore', () => {
  const services = ref<Service[]>([]);
  const stubs = ref<ServiceStub[]>([]);
  const statuses = ref<ServiceStatus[]>([]);

  const serviceIds = computed<string[]>(() => services.value.map((v) => v.id));
  const stubIds = computed<string[]>(() => stubs.value.map((v) => v.id));

  function serviceById(id: Maybe<string>): Service | null {
    return findById(services.value, id);
  }

  function setService(service: Service): void {
    services.value = concatById(services.value, service);
    stubs.value = filterById(stubs.value, service); // stubs have the same ID
  }

  function setAllServices(incoming: Service[]): void {
    const ids = incoming.map((svc) => svc.id);
    services.value = [...incoming];
    stubs.value = stubs.value.filter((s) => !ids.includes(s.id));
  }

  function trySetStub(stub: ServiceStub): void {
    if (!serviceById(stub.id)) {
      stubs.value = concatById(stubs.value, stub);
    }
  }

  function setStatus(status: ServiceStatus): void {
    statuses.value = concatById(statuses.value, status);
  }

  async function createService(service: Service): Promise<void> {
    await api.create(service); // triggers callback
  }

  async function saveService(service: Service): Promise<void> {
    await api.persist(service); // triggers callback
  }

  async function removeService(service: Service): Promise<void> {
    await api.remove(service); // triggers callback
  }

  async function ensureStub(stub: ServiceStub): Promise<void> {
    trySetStub(stub);
  }

  async function updateStatus(status: ServiceStatus): Promise<void> {
    if (!statuses.value.some((v) => isEqual(v, status))) {
      setStatus(status);
    }
  }

  async function start(): Promise<void> {
    const onChange = async (service: Service): Promise<void> => {
      const existing = serviceById(service.id);
      setService(service);
      if (!existing) {
        await onStartService(service);
      }
    };
    const onDelete = async (id: string): Promise<void> => {
      const existing = serviceById(id);
      if (existing) {
        await onRemoveService(existing);
        services.value = filterById(services.value, existing);
      }
    };

    const initialServices = await api.fetch();
    setAllServices(initialServices);
    await Promise.all(initialServices.map(onStartService));

    api.subscribe(onChange, onDelete);
  }

  return {
    services,
    stubs,
    statuses,

    serviceIds,
    stubIds,

    serviceById,
    setService,
    setAllServices,
    trySetStub,
    setStatus,
    createService,
    saveService,
    removeService,
    ensureStub,
    updateStatus,
    start,
  };
});
