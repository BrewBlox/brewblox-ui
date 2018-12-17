import { createAccessors } from '@/helpers/static-store';
import Vue from 'vue';
import { MutationTree } from 'vuex';
import { Service, ServiceState } from './state';

const { commit } = createAccessors('services');

export const mutations: MutationTree<ServiceState> = {
  setService: (state: ServiceState, service: Service) =>
    Vue.set(state.services, service.id, { ...service }),

  setAllServices: (state: ServiceState, services: Service[]) =>
    Vue.set(
      state,
      'services',
      services.reduce((acc, service) => ({ ...acc, [service.id]: service }), {}),
    ),

  removeService: (state: ServiceState, id: string) =>
    Vue.delete(state.services, id),
};

export const setService = commit(mutations.setService);
export const setAllServices = commit(mutations.setAllServices);
export const removeService = commit(mutations.removeService);
