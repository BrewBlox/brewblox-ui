import { RootStore } from '@/store/state';
import { Service } from '@/store/services/state';
import { registerService } from '@/helpers/dynamic-store';

import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const vuexModule = () => ({
  actions,
  getters,
  mutations,
  namespaced: true,
  strict: true,
  state: {
    blocks: {},
    units: {},
    unitAlternatives: {},
    compatibleBlocks: {},
    discoveredBlocks: [],
    fetching: true,
  },
});

export const register = async (store: RootStore, service: Service) =>
  registerService(store, service.id, vuexModule());
