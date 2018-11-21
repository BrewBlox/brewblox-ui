import { createAccessors } from '@/helpers/static-store';
import Vue from 'vue';
import { Service, ServiceState } from './state';

const { commit } = createAccessors('services');

export const mutations = {
  addService: (state: ServiceState, service: Service) =>
    Vue.set(state.services, service.id, { ...service }),

  setServices: (state: ServiceState, services: Service[]) =>
    Vue.set(
      state,
      'services',
      services.reduce((acc, service) => ({ ...acc, [service.id]: service }), {}),
    ),

  updateService: (state: ServiceState, service: Partial<Service>) => {
    const id = service.id || '';
    const existing = state.services[id];
    if (!existing) {
      throw new Error(`Block with id '${id}' does not exist`);
    }
    Vue.set(state.services, id, { ...existing, ...service });
  },

  mutateService: (state: ServiceState, service: Partial<Service>) =>
    mutations.updateService(state, service),

  removeService: (state: ServiceState, id: string) =>
    Vue.delete(state.services, id),
};

export const addService = commit(mutations.addService);
export const setServices = commit(mutations.setServices);
export const mutateService = commit(mutations.mutateService);
export const removeService = commit(mutations.removeService);
