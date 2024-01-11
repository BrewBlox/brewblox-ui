import isEqual from 'lodash/isEqual';
import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';
import { ServiceHook, useFeatureStore } from '@/store/features';
import { makeObjectSorter } from '@/utils/functional';
import api from './api';
import type { Service, ServiceStatus, ServiceStub } from './types';

export * from './types';

const sorter = makeObjectSorter<Service | ServiceStub | ServiceStatus>('id');

const onStartService: ServiceHook = (service) =>
  useFeatureStore().serviceById(service.type)?.onStart?.(service);

const onRemoveService: ServiceHook = (service) =>
  useFeatureStore().serviceById(service.type)?.onRemove?.(service);

export const useServiceStore = defineStore('serviceStore', () => {
  const serviceMap = reactive<Mapped<Service>>({});
  const stubMap = reactive<Mapped<ServiceStub>>({});
  const statusMap = reactive<Mapped<ServiceStatus>>({});

  const services = computed<Service[]>(() =>
    Object.values(serviceMap).sort(sorter),
  );
  const stubs = computed<ServiceStub[]>(() =>
    Object.values(stubMap).sort(sorter),
  );
  const statuses = computed<ServiceStatus[]>(() =>
    Object.values(statusMap).sort(sorter),
  );

  const serviceIds = computed<string[]>(() => services.value.map((v) => v.id));
  const stubIds = computed<string[]>(() => stubs.value.map((v) => v.id));

  function serviceById(id: Maybe<string>): Service | null {
    return serviceMap[id ?? ''] ?? null;
  }

  function setService(service: Service): void {
    serviceMap[service.id] = service;
    delete stubMap[service.id];
  }

  function trySetStub(stub: ServiceStub): void {
    if (serviceMap[stub.id] == null) {
      stubMap[stub.id] = stub;
    }
  }

  function setStatus(status: ServiceStatus): void {
    statusMap[status.id] = status;
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
        delete serviceMap[id];
      }
    };

    const initialServices = await api.fetch();
    initialServices.forEach((v) => (serviceMap[v.id] = v));
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
