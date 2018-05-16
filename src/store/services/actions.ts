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
    // update isFetching
    mutateFetchingInStore(context, true);

    // will fetch services from the server
    const services = await fetchServicesFromApi();

    // add the services to the store
    services.forEach(service => actions.addService(context, service));

    // update isFetching
    mutateFetchingInStore(context, false);
  },
};

// exported action accessors
export const fetchServices = dispatch(actions.fetchServices);

export default actions;
