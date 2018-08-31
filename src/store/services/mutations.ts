import Vue from 'vue';
import { getStoreAccessors } from 'vuex-typescript';

import { ServicesState, Service } from './state';

import { State as RootState } from '../state';

const { commit } = getStoreAccessors<ServicesState, RootState>('services');

const mutations = {

  addService(state: ServicesState, service: Service) {
    Vue.set(state.services, service.id, { ...service });
  },

  mutateFetching(state: ServicesState, fetching: boolean) {
    state.fetching = fetching;
  },
};

// exported commit accessors
export const mutateFetching = commit(mutations.mutateFetching);
export const addService = commit(mutations.addService);

export default mutations;
