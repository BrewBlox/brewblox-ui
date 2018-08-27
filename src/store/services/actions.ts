import { getStoreAccessors } from 'vuex-typescript';

import { fetchServices as fetchServicesFromApi } from './api';
import {
  mutateFetching as mutateFetchingInStore,
  addService as addServiceToStore,
} from './mutations';

import { ServicesState, Service, ServicesContext } from './state';
import { State as RootState } from '../state';

const { dispatch } = getStoreAccessors<ServicesState, RootState>('services');

const actions = {
  addService(context: ServicesContext, service: Service) {
    addServiceToStore(context, service);
  },
  async fetchServices(context: ServicesContext) {
    mutateFetchingInStore(context, true);
    const services = await fetchServicesFromApi();
    services.forEach(service => actions.addService(context, service));
    mutateFetchingInStore(context, false);
  },
};

// exported action accessors
export const fetchServices = dispatch(actions.fetchServices);

export default actions;
