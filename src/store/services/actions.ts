import { createAccessors } from '@/helpers/static-store';
import { ActionTree } from 'vuex';
import { fetcherById, initializerById } from '@/store/providers/getters';
import { RootState, RootStore } from '../state';
import {
  createService as createServiceInApi,
  deleteService as removeServiceInApi,
  fetchServices as fetchServicesInApi,
  persistService as persistServiceInApi,
  setup as setupInApi,
} from './api';
import {
  serviceById as getServiceInStore,
  tryServiceById as tryGetServiceInStore,
} from './getters';
import {
  setService as setServiceInStore,
  setAllServices as setAllServicesInStore,
  removeService as removeServiceInStore,
} from './mutations';
import { Service, ServicesContext, ServiceState } from './state';

const { dispatch } = createAccessors('services');

export const actions: ActionTree<ServiceState, RootState> = {
  createService: async (context: ServicesContext, service: Service) =>
    setServiceInStore(context, await createServiceInApi(service)),

  saveService: async (context: ServicesContext, service: Service) =>
    setServiceInStore(context, await persistServiceInApi(service)),

  removeService: async (context: ServicesContext, service: Service) => {
    await removeServiceInApi(service);
    removeServiceInStore(context, service.id);
  },

  updateServiceOrder: async (context: ServicesContext, ids: string[]) =>
    ids.forEach((id, idx) => {
      persistServiceInApi({ ...getServiceInStore(context, id), order: idx + 1 })
        .then(service => setServiceInStore(context, service));
    }),
};

export const createService = dispatch(actions.createService);
export const saveService = dispatch(actions.saveService);
export const removeService = dispatch(actions.removeService);
export const updateServiceOrder = dispatch(actions.updateServiceOrder);

export const initService = async (store: RootStore, service: Service) => {
  await initializerById(store, service.type)(store, service);
  await fetcherById(store, service.type)(store, service);
};

export const setupApi = async (store: RootStore) => {
  /* eslint-disable no-underscore-dangle */
  const onChange = async (service: Service) => {
    const existing = tryGetServiceInStore(store, service.id);
    if (!existing) {
      setServiceInStore(store, service);
      await initService(store, service);
    } else if (existing._rev !== service._rev) {
      setServiceInStore(store, service);
    }
  };
  const onDelete = (id: string) => {
    const existing = tryGetServiceInStore(store, id);
    if (existing) {
      removeServiceInStore(store, existing);
    }
  };
  /* eslint-enable no-underscore-dangle */

  const services = await fetchServicesInApi();
  setAllServicesInStore(store, services);
  await Promise.all(services.map(service => initService(store, service)));

  setupInApi(onChange, onDelete);
};
