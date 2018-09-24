import { getStoreAccessors } from 'vuex-typescript';
import { RootState } from '../state';
import { ServiceState, Service, ServicesContext } from './state';
import { serviceById as getServiceInStore } from './getters';
import {
  fetchServices as fetchServicesInApi,
  createService as createServiceInApi,
  updateService as updateServiceInApi,
  deleteService as removeServiceInApi,
} from './api';
import {
  mutateFetching as mutateFetchingInStore,
  addService as addServiceToStore,
  mutateService as mutateServiceInStore,
  removeService as removeServiceInStore,
} from './mutations';

const { dispatch } = getStoreAccessors<ServiceState, RootState>('services');

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
    const savedService = await updateServiceInApi(service);
    mutateServiceInStore(context, { ...savedService, isLoading: false });
  },

  async removeService(context: ServicesContext, service: Service) {
    mutateServiceInStore(context, { ...service, isLoading: true });
    await removeServiceInApi(service);
    removeServiceInStore(context, service.id);
  },

  async updateServiceOrder(context: ServicesContext, ids: string[]) {
    ids.forEach((id, idx) => {
      const order = idx + 1;
      mutateServiceInStore(context, { id, order });
      updateServiceInApi(getServiceInStore(context, id));
    });
  },
};

export const fetchServices = dispatch(actions.fetchServices);
export const createService = dispatch(actions.createService);
export const saveService = dispatch(actions.saveService);
export const removeService = dispatch(actions.removeService);
export const updateServiceOrder = dispatch(actions.updateServiceOrder);

export default actions;
