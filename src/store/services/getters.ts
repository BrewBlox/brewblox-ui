import { getStoreAccessors } from 'vuex-typescript';

import { RootState, RootStore } from '../state';
import { ServiceState, Service, ServicesContext } from './state';

const { read } = getStoreAccessors<ServiceState, RootState>('services');

const getters = {
  services: (state: ServiceState): { [id: string]: Service } => state.services,
  serviceIds: (state: ServiceState): string[] => Object.keys(state.services),
  serviceValues: (state: ServiceState): Service[] => Object.values(state.services),
  isFetching: (state: ServiceState): boolean => state.fetching,
};

const services = read(getters.services);

export const serviceIds = read(getters.serviceIds);
export const allServices = read(getters.serviceValues);
export const isFetching = read(getters.isFetching);

export function serviceById<T extends Service>(
  store: RootStore | ServicesContext,
  id: string, type?: string,
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

export const serviceExists = (store: RootStore | ServicesContext, id: string) =>
  !!services(store)[id];

export default getters;
