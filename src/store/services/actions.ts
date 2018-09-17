import { getStoreAccessors } from 'vuex-typescript';

import { State as RootState } from '../state';

import { ServicesState, Service, ServicesContext } from './state';

import {
  fetchServices as fetchServicesInApi,
  createService as createServiceInApi,
  persistService as persistServiceInApi,
  deleteService as removeServiceInApi,
} from './api';
import {
  mutateFetching as mutateFetchingInStore,
  addService as addServiceToStore,
  mutateService as mutateServiceInStore,
  removeService as removeServiceInStore,
} from './mutations';

const { dispatch } = getStoreAccessors<ServicesState, RootState>('services');

const actions = {
  async fetchServices(context: ServicesContext) {
    mutateFetchingInStore(context, true);
    const services = await fetchServicesInApi();
    services.forEach(service => addServiceToStore(context, service));
    mutateFetchingInStore(context, false);
  },

  async createService(context: ServicesContext, service: Service) {
    addServiceToStore(context, { ...service, isLoading: true });
    const created = await createServiceInApi(service);
    mutateServiceInStore(context, { ...created, isLoading: false });
    return created;
  },

  async saveService(context: ServicesContext, service: Service) {
    mutateServiceInStore(context, { ...service, isLoading: true });
    const savedService = await persistServiceInApi(service);
    mutateServiceInStore(context, { ...savedService, isLoading: false });
  },

  async removeService(context: ServicesContext, service: Service) {
    mutateServiceInStore(context, { ...service, isLoading: true });
    await removeServiceInApi(service);
    removeServiceInStore(context, service.id);
  },
};

export const fetchServices = dispatch(actions.fetchServices);
export const createService = dispatch(actions.createService);
export const saveService = dispatch(actions.saveService);
export const removeService = dispatch(actions.removeService);

export default actions;
