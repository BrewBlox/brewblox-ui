import Vue from 'vue';
import { getStoreAccessors } from 'vuex-typescript';

import { ServiceState, Service } from './state';

import { RootState } from '../state';

const { commit } = getStoreAccessors<ServiceState, RootState>('services');

const mutations = {
  addService(state: ServiceState, service: Service) {
    Vue.set(state.services, service.id, { ...service });
  },

  updateService(state: ServiceState, service: Partial<Service>) {
    const id = service.id || '';
    const existing = state.services[id];
    if (!existing) {
      throw new Error(`Block with id '${id}' does not exist`);
    }
    Vue.set(state.services, id, { ...existing, ...service });
  },

  mutateService(state: ServiceState, service: Partial<Service>) {
    mutations.updateService(state, service);
  },

  removeService(state: ServiceState, id: string) {
    Vue.delete(state.services, id);
  },

  mutateFetching(state: ServiceState, fetching: boolean) {
    state.fetching = fetching;
  },
};

export const mutateFetching = commit(mutations.mutateFetching);
export const addService = commit(mutations.addService);
export const mutateService = commit(mutations.mutateService);
export const removeService = commit(mutations.removeService);

export default mutations;
