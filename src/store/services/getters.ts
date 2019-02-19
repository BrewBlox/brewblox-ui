import { createAccessors } from '@/helpers/static-store';
import { GetterTree } from 'vuex';
import { RootState, RootStore } from '../state';
import { Service, ServicesContext, ServiceState } from './state';

const { read } = createAccessors('services');

export const getters: GetterTree<ServiceState, RootState> = {
  replicating: (state: ServiceState): boolean => state.replicating,
  services: (state: ServiceState): { [id: string]: Service } => state.services,
  serviceIds: (state: ServiceState): string[] => Object.keys(state.services),
  serviceValues: (state: ServiceState): Service[] => Object.values(state.services),
};

const services = read(getters.services);

export const serviceIds = read(getters.serviceIds);
export const serviceValues = read(getters.serviceValues);

export function serviceById<T extends Service>(
  store: RootStore | ServicesContext,
  id: string,
  type?: string,
): T {
  const service = services(store)[id];
  if (!service) {
    throw new Error(`Service ${id} not found`);
  }
  if (service && type && service.type !== type) {
    throw new Error(`Invalid service: ${service.type} !== ${type}`);
  }
  return service as T;
}

export const tryServiceById =
  (store: RootStore | ServicesContext, id: string): Service =>
    services(store)[id];

export const serviceExists =
  (store: RootStore | ServicesContext, id: string): boolean =>
    !!services(store)[id];
