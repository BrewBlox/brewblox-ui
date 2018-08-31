import { map } from 'lodash';

import { getStoreAccessors } from 'vuex-typescript';

import { ServicesState, Service, DeviceService } from './state';
import { State as RootState, RootStore } from '../state';

const { read } = getStoreAccessors<ServicesState, RootState>('services');

const getters = {
  servicesById: (state: ServicesState): { [id: string]: Service } => state.services,

  serviceIds(state: ServicesState): string[] {
    return map(state.services, (_: Service, key: string) => key);
  },

  allServices(state: ServicesState): Service[] {
    return map(state.services, (svc: Service) => svc);
  },

  deviceServices(state: ServicesState): DeviceService[] {
    return getters
      .allServices(state)
      .filter(service => service.type === 'DeviceService') as DeviceService[];
  },

  isFetching(state: ServicesState): boolean {
    return state.fetching;
  },

};

// exported getter accessors
const servicesById = read(getters.servicesById);

export const allServices = read(getters.allServices);
export const deviceServices = read(getters.deviceServices);
export const serviceIds = read(getters.serviceIds);

export const serviceById =
  (store: RootStore, id: string): Service => servicesById(store)[id];

export const isFetching = read(getters.isFetching);

export default getters;
