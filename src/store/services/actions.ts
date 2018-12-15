import { createAccessors } from '@/helpers/static-store';
import { ActionTree } from 'vuex';
import { RootState, RootStore } from '../state';
import {
  createService as createServiceInApi,
  deleteService as removeServiceInApi,
  fetchServices as fetchServicesInApi,
  updateService as updateServiceInApi,
  setup as setupInApi,
} from './api';
import { serviceById as getServiceInStore } from './getters';
import {
  addService as addServiceToStore,
  mutateService as mutateServiceInStore,
  removeService as removeServiceInStore,
  setServices as setServicesInStore,
} from './mutations';
import { Service, ServicesContext, ServiceState } from './state';

const { dispatch } = createAccessors('services');

export const actions: ActionTree<ServiceState, RootState> = {
  fetchServices: async (context: ServicesContext) => {
    setServicesInStore(context, await fetchServicesInApi());
  },

  createService: async (context: ServicesContext, service: Service) => {
    addServiceToStore(context, { ...service, isLoading: true });
    const created = await createServiceInApi(service);
    mutateServiceInStore(context, { ...created, isLoading: false });
    return created;
  },

  saveService: async (context: ServicesContext, service: Service) => {
    mutateServiceInStore(context, { ...service, isLoading: true });
    const savedService = await updateServiceInApi(service);
    mutateServiceInStore(context, { ...savedService, isLoading: false });
  },

  removeService: async (context: ServicesContext, service: Service) => {
    mutateServiceInStore(context, { ...service, isLoading: true });
    await removeServiceInApi(service);
    removeServiceInStore(context, service.id);
  },

  updateServiceOrder: async (context: ServicesContext, ids: string[]) => {
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

export const setupApi = (store: RootStore) => {
  /* eslint-disable no-underscore-dangle */
  const onChange = (service: Service) => {
    const existing = getServiceInStore(store, service.id);
    if (!existing || existing._rev !== service._rev) {
      setServicesInStore(store, service);
    }
  };
  const onDelete = (id: string) => {
    const existing = getServiceInStore(store, id);
    if (existing) {
      removeServiceInStore(store, existing);
    }
  };
  /* eslint-enable no-underscore-dangle */

  setupInApi(onChange, onDelete, (err) => { });
};
